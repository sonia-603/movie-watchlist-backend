/**
 * Single success envelope used by every controller:
 * { success: true, message?, data, meta? }
 */
const sendSuccess = (res, data, { statusCode = 200, message, meta } = {}) => {
  const body = { success: true };
  if (message) body.message = message;
  body.data = data;
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess };
