const fs = require('fs/promises');

/**
 * The browser-reported MIME type is just a header and can be spoofed, so after
 * multer writes the file we also check its "magic bytes".
 */
const matchesImageSignature = (buffer, mimetype) => {
  if (!buffer || buffer.length < 12) return false;

  switch (mimetype) {
    case 'image/jpeg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'image/webp':
      return (
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    default:
      return false;
  }
};

const fileHasImageSignature = async (filePath, mimetype) => {
  const handle = await fs.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, 12, 0);
    return matchesImageSignature(buffer.subarray(0, bytesRead), mimetype);
  } finally {
    await handle.close();
  }
};

module.exports = { matchesImageSignature, fileHasImageSignature };
