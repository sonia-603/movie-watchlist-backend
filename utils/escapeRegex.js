/** Escapes user text so it can be used literally inside a RegExp (prevents ReDoS / regex injection). */
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = escapeRegex;
