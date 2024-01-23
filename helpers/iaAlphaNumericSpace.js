const isAlphaNumericSpace = async (input) => {
  const alphaNumericWithSpaceRegex = /^[a-zA-Z0-9\s]+$/;
  return alphaNumericWithSpaceRegex.test(input);
};

module.exports = isAlphaNumericSpace;