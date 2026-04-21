/**
 * ============================================================
 * ADMIN LOGIN PAGE
 * ============================================================
 * Mirrors client-side LoginScreen.tsx design:
 *  - Gradient background with floating decorations
 *  - Form validation (email format, password length)
 *  - Error handling with inline + global error messages
 *  - Demo credentials quick-fill
 *  - Loading states
 * 
 * Design matches: colors, spacing, shadows, input styles
 * ============================================================
 */

import { useState } from 'react';
import { ADMIN_ACCOUNTS } from './data/appShellData';
import { colors } from './theme';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form validation
  const validate = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setGlobalError('');
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 900));
      
      // Admin credentials lookup
      const match = ADMIN_ACCOUNTS.find(a => a.email === email && a.password === password);
      if (match) {
        onLoginSuccess({ name: match.name, email, role: 'superadmin', avatar: match.avatar });
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (err) {
      setGlobalError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill demo credentials (Firas admin account)
  const fillDemo = () => {
    setEmail('firas@smartmatch.com');
    setPassword('firas123');
    setErrors({});
    setGlobalError('');
  };

  return (
    <div style={styles.container}>
      {/* Background decorations - matches client gradient hero */}
      <div style={styles.decoration1} />
      <div style={styles.decoration2} />
      <div style={styles.decoration3} />

      <div style={styles.content}>
        {/* Logo + Title */}
        <div style={styles.hero}>
          <div style={styles.logoContainer}>
            <span style={styles.logoIcon}>✦</span>
          </div>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>SmartMatch Administration</p>
        </div>

        {/* Form Card */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            
            {/* Global error message */}
            {globalError && (
              <div style={styles.errorBanner}>
                <span style={styles.errorIcon}>⚠️</span>
                {globalError}
              </div>
            )}

            {/* Email Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="admin@smartmatch.com"
                  style={{
                    ...styles.input,
                    borderColor: errors.email ? colors.error : colors.neutral[200],
                    background: errors.email ? '#fff5f5' : colors.neutral[50],
                  }}
                />
              </div>
              {errors.email && (
                <div style={styles.errorText}>{errors.email}</div>
              )}
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  style={{
                    ...styles.input,
                    borderColor: errors.password ? colors.error : colors.neutral[200],
                    background: errors.password ? '#fff5f5' : colors.neutral[50],
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.togglePasswordBtn}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && (
                <div style={styles.errorText}>{errors.password}</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                background: loading ? colors.neutral[300] : `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[500]})`,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : `0 4px 16px ${colors.primary[500]}44`,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>

            {/* Demo Credentials */}
            <div style={styles.demoSection}>
              <button
                type="button"
                onClick={fillDemo}
                style={styles.demoButton}
              >
                Use demo credentials
              </button>
              <div style={styles.demoBox}>
                📧 firas@smartmatch.com &nbsp;|&nbsp; 🔑 firas123
              </div>
            </div>
          </form>
        </div>

        <p style={styles.footer}>
          SmartMatch Admin Panel v2.0 — Restricted Access
        </p>
      </div>
    </div>
  );
}

// Styles object
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.primary[700]} 50%, ${colors.primary[500]} 100%)`,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  decoration1: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: '-100px',
    left: '-100px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    pointerEvents: 'none',
  },
  decoration2: {
    position: 'absolute',
    width: 200,
    height: 200,
    bottom: '-80px',
    right: '-60px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    pointerEvents: 'none',
  },
  decoration3: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: '40%',
    right: '10%',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    pointerEvents: 'none',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    zIndex: 1,
  },
  hero: {
    textAlign: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    margin: '0 auto 16px',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 900,
    margin: '0 0 8px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    margin: 0,
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  form: {
    padding: 32,
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: colors.neutral[700],
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 16,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 38px',
    borderRadius: 10,
    border: '1.5px solid',
    outline: 'none',
    fontSize: 14,
    boxSizing: 'border-box',
    color: colors.neutral[800],
    fontFamily: 'inherit',
  },
  togglePasswordBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    fontWeight: 500,
  },
  submitBtn: {
    width: '100%',
    padding: 13,
    borderRadius: 12,
    border: 'none',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    marginTop: 20,
    transition: 'all 0.15s',
    letterSpacing: '0.01em',
  },
  demoSection: {
    marginTop: 20,
    textAlign: 'center',
  },
  demoButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: colors.primary[600],
    fontWeight: 600,
    padding: '8px 12px',
  },
  demoBox: {
    marginTop: 8,
    background: colors.primary[50],
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 12,
    color: colors.primary[700],
  },
  footer: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
};
