# Small demo: train a CatBoostRegressor on synthetic matching data,
# then predict match scores and rank providers for a single request.

import random
from dataclasses import dataclass
from typing import List, Dict, Any

import numpy as np
import pandas as pd
from catboost import CatBoostRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error


# ---------------------------
# 1) Helpers: feature scoring
# ---------------------------

def distance_score(distance_km: float, max_radius_km: float = 20.0) -> float:
    """Map distance in km to a score in [0, 1]. Closer = higher."""
    return max(0.0, 1.0 - (distance_km / max_radius_km))


def experience_score(years: int, cap_years: int = 10) -> float:
    """Normalize experience years into [0, 1]."""
    return min(max(years, 0) / cap_years, 1.0)


def trust_scaled(trust_score_0_to_5: float) -> float:
    """Scale rating/trust from 0..5 to 0..1."""
    return float(np.clip(trust_score_0_to_5 / 5.0, 0.0, 1.0))


def completed_jobs_score(completed_jobs: int, cap_jobs: int = 200) -> float:
    """Normalize completed jobs into [0, 1]."""
    return min(max(completed_jobs, 0) / cap_jobs, 1.0)


def compute_target_score(row: Dict[str, Any]) -> float:
    """
    Synthetic supervision signal (the "ground truth" for our MVP):
    Weighted multi-criteria score -> target_score in [0, 1].

    Later, when you get real usage data:

        Replace target_score with:

            -Whether provider accepted

            -Whether job was completed

            -Client rating after job

            -Response time

        Then our system becomes truly data-driven.
    """
    s_skill = float(np.clip(row["skill_overlap"], 0.0, 1.0))
    s_dist = distance_score(row["distance_km"], max_radius_km=20.0)
    s_trust = trust_scaled(row["trust_score"])
    s_exp = experience_score(int(row["experience_years"]), cap_years=10)
    s_jobs = completed_jobs_score(int(row["completed_jobs"]), cap_jobs=200)
    s_avail = 1.0 if int(row["is_available"]) == 1 else 0.0
    s_field = 1.0 if int(row["field_match"]) == 1 else 0.0

    # Weights (tune later)
    score = (
        0.35 * s_skill +
        0.20 * s_dist +
        0.20 * s_trust +
        0.10 * s_exp +
        0.05 * s_jobs +
        0.10 * s_avail
    )

    # If field doesn't match, we penalize strongly (business rule)
    score *= (0.4 + 0.6 * s_field)  # if field_match=0 -> multiply by 0.4

    return float(np.clip(score, 0.0, 1.0))


# --------------------------------------
# 2) Generate a small synthetic dataset
# --------------------------------------

def generate_synthetic_rows(n_rows: int = 2000, seed: int = 42) -> pd.DataFrame:
    random.seed(seed)
    np.random.seed(seed)

    rows = []
    for i in range(n_rows):
        # Make "realistic-ish" distributions
        row = {
            "distance_km": round(float(np.clip(np.random.gamma(shape=2.0, scale=3.0), 0, 30)), 2),
            "field_match": int(np.random.choice([0, 1], p=[0.2, 0.8])),
            "skill_overlap": round(float(np.clip(np.random.beta(a=2.5, b=1.8), 0, 1)), 2),
            "trust_score": round(float(np.clip(np.random.normal(loc=4.2, scale=0.5), 0, 5)), 1),
            "completed_jobs": int(np.clip(np.random.exponential(scale=60), 0, 250)),
            "experience_years": int(np.clip(np.random.normal(loc=5, scale=3), 0, 20)),
            "is_available": int(np.random.choice([0, 1], p=[0.25, 0.75])),
        }

        row["target_score"] = compute_target_score(row)
        rows.append(row)

    return pd.DataFrame(rows)


# ---------------------------
# 3) Train the ML model
# ---------------------------

FEATURES = [
    "distance_km",
    "field_match",
    "skill_overlap",
    "trust_score",
    "completed_jobs",
    "experience_years",
    "is_available",
]
TARGET = "target_score"


def train_model(df: pd.DataFrame) -> CatBoostRegressor:
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = CatBoostRegressor(
        loss_function="RMSE",
        iterations=500,
        learning_rate=0.08,
        depth=6,
        random_seed=42,
        verbose=False
    )

    model.fit(X_train, y_train, eval_set=(X_val, y_val), use_best_model=True)

    preds = model.predict(X_val)
    mae = mean_absolute_error(y_val, preds)
    print(f"Validation MAE: {mae:.4f}")

    return model


# -------------------------------------------------
# 4) Inference demo: rank providers for one request
# -------------------------------------------------

@dataclass
class ProviderCandidate:
    provider_id: str
    distance_km: float
    field_match: int
    skill_overlap: float
    trust_score: float
    completed_jobs: int
    experience_years: int
    is_available: int


def rank_providers(model: CatBoostRegressor, providers: List[ProviderCandidate], top_k: int = 5):
    df_candidates = pd.DataFrame([p.__dict__ for p in providers])
    df_candidates["predicted_score"] = model.predict(df_candidates[FEATURES])
    df_candidates = df_candidates.sort_values("predicted_score", ascending=False).reset_index(drop=True)
    return df_candidates.head(top_k)


if __name__ == "__main__":
    # 1) Create training data and train model
    df_train = generate_synthetic_rows(n_rows=3000, seed=42)
    model = train_model(df_train)

    # 2) Demo candidates for a single request
    candidates = [
        ProviderCandidate("P045", 3.2, 1, 0.85, 4.6, 120, 6, 1),
        ProviderCandidate("P012", 12.5, 1, 0.70, 4.9, 40, 2, 1),
        ProviderCandidate("P077", 5.1, 0, 0.90, 4.8, 200, 10, 1),  # field mismatch -> penalty
        ProviderCandidate("P103", 2.0, 1, 0.60, 3.8, 15, 1, 1),
        ProviderCandidate("P201", 18.0, 1, 0.55, 4.2, 90, 8, 0),   # unavailable
    ]

    top = rank_providers(model, candidates, top_k=5)

    print("\nTop providers for request R001 (ranked):")
    print(top[["provider_id", "predicted_score"] + FEATURES].to_string(index=False))
