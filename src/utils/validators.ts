export const validateStrongPassword = (pwd: string) => {
  const hasMinLength = (pwd || '').length >= 8;
  const hasUpper = /[A-Z]/.test(pwd || '');
  const hasLower = /[a-z]/.test(pwd || '');
  const hasNumber = /[0-9]/.test(pwd || '');
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd || '');

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  return { hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial, isValid };
};
