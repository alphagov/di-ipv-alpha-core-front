/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
function ValidateInput() {}

ValidateInput.int = (stringToValidate) => {
  const parsedInt = parseInt(stringToValidate, 10);
  return isNaN(parsedInt) ? undefined : parsedInt;
};

ValidateInput.string = (stringToValidate) =>
  stringToValidate && (`${stringToValidate}` || undefined);

export default ValidateInput;
