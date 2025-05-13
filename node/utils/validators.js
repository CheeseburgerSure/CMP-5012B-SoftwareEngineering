
// Helper: Validate password strength
function validatePassword(password) {
  const errors = [];

  // Length Check
  if (password.length < 8 || password.length > 16) {
    errors.push('Password must be between 8 and 16 characters.');
  }

  // Upper Case Check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }

  // Number Checker
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number.');
  }

  // Special Character Check
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { validatePassword };
