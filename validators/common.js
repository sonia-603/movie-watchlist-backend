/** Small, dependency-free helpers shared by the request validators. */

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Accepts numbers or numeric strings ("12"), returns NaN for anything else. */
const toInteger = (value) => {
  if (typeof value === 'number') return Number.isInteger(value) ? value : NaN;
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return Number(value.trim());
  return NaN;
};

/** Parses optional positive integer query values with a default and bounds. */
const parseBoundedInt = (raw, { field, defaultValue, min, max }, errors) => {
  if (raw === undefined || raw === '') return defaultValue;
  const value = toInteger(raw);
  if (Number.isNaN(value) || value < min || value > max) {
    errors.push({ field, message: `${field} must be a whole number between ${min} and ${max}` });
    return defaultValue;
  }
  return value;
};

module.exports = { isPlainObject, toInteger, parseBoundedInt };
