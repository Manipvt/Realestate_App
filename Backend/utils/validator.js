const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRequired = (fields) => {
  const missing = [];
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(key);
    }
  }
  return missing;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired
};
