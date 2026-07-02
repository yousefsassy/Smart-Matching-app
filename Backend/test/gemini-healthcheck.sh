#!/bin/bash

# 1. Load environment variables from parent folder
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
if [ -f "$SCRIPT_DIR/../.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/../.env" | xargs)
else
    echo " Error: .env file not found in parent directory."
    exit 1
fi

# 2. Check if API Key is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo " Error: GEMINI_API_KEY is not set in .env"
    exit 1
fi

echo " Starting Health Check for Gemini Model: $GEMINI_MODEL..."


# Tokenless

STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}?key=${GEMINI_API_KEY}")

if [ "$STATUS_CODE" -eq 200 ]; then
    echo "[SUCCESS] Model '$GEMINI_MODEL' is reachable and your API key is valid."
elif [ "$STATUS_CODE" -eq 403 ]; then
    echo "[AUTH ERROR] Status 403: Your API Key is invalid or restricted."
elif [ "$STATUS_CODE" -eq 404 ]; then
    echo "[NOT FOUND] Status 404: The model name '$GEMINI_MODEL' is incorrect."
else
    echo "[FAILED] Status $STATUS_CODE: Something went wrong."
    exit 1
fi