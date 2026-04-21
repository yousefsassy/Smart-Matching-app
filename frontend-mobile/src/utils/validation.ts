export interface PasswordCriterion {
  label: string;
  test: (password: string) => boolean;
}

export interface PasswordStrength {
  level: number;
  label: string;
  color: string;
}

export const LOGIN_PASSWORD_MIN_LENGTH = 6;
export const SIGNUP_PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_CRITERIA: PasswordCriterion[] = [
  { label: 'At least 8 characters', test: (password) => password.length >= 8 },
  { label: 'One uppercase letter', test: (password) => /[A-Z]/.test(password) },
  { label: 'One number', test: (password) => /\d/.test(password) },
  {
    label: 'One special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email.trim());
}

export function getEmailError(email: string) {
  if (!email.trim()) {
    return 'Email is required';
  }

  if (!isValidEmail(email)) {
    return 'Please enter a valid email';
  }

  return undefined;
}

export function getLoginPasswordError(password: string) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < LOGIN_PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${LOGIN_PASSWORD_MIN_LENGTH} characters`;
  }

  return undefined;
}

export function getSignupPasswordError(password: string) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
    return `Must be at least ${SIGNUP_PASSWORD_MIN_LENGTH} characters`;
  }

  return undefined;
}

export function getConfirmPasswordError(password: string, confirmPassword: string) {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return undefined;
}

export function getFullNameError(fullName: string) {
  if (!fullName.trim()) {
    return 'Full name is required';
  }

  if (fullName.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }

  return undefined;
}

export function getPasswordStrength(
  password: string,
  colors: {
    neutral: string;
    error: string;
    warning: string;
    caution: string;
    success: string;
  }
): PasswordStrength {
  const passed = PASSWORD_CRITERIA.filter((criterion) => criterion.test(password)).length;

  if (passed === 0) {
    return { level: 0, label: '', color: colors.neutral };
  }

  if (passed === 1) {
    return { level: 1, label: 'Weak', color: colors.error };
  }

  if (passed === 2) {
    return { level: 2, label: 'Fair', color: colors.warning };
  }

  if (passed === 3) {
    return { level: 3, label: 'Good', color: colors.caution };
  }

  return { level: 4, label: 'Strong', color: colors.success };
}
