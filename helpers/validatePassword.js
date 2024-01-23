// validatePassword.js
const validator = require("validator");

function validatePassword(password) {
  const allowedCharsRegex = /^[A-Za-z\d@$!%^&*_+=]+$/;

  if (password.length < 8) {
    throw new Error("Password should be at least 8 characters long.");
  }

  if (!allowedCharsRegex.test(password)) {
    throw new Error("Invalid characters in password.");
  }

  return { success: true, message: "Password is valid." };
}

module.exports = validatePassword;