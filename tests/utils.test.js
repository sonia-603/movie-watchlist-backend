const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { matchesImageSignature } = require('../utils/fileSignature');
const escapeRegex = require('../utils/escapeRegex');

const pad = (bytes) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(12)]);

describe('matchesImageSignature', () => {
  test('recognises real JPEG, PNG and WEBP headers', () => {
    assert.ok(matchesImageSignature(pad([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg'));
    assert.ok(matchesImageSignature(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png'));
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);
    assert.ok(matchesImageSignature(webp, 'image/webp'));
  });

  test('rejects a script disguised as an image', () => {
    const fake = Buffer.from('<?php echo "hi"; ?>');
    assert.equal(matchesImageSignature(fake, 'image/jpeg'), false);
    assert.equal(matchesImageSignature(fake, 'image/png'), false);
  });

  test('rejects a PNG declared as JPEG', () => {
    assert.equal(matchesImageSignature(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/jpeg'), false);
  });
});

describe('escapeRegex', () => {
  test('makes user input safe to use inside a RegExp', () => {
    const pattern = new RegExp(escapeRegex('(.*)+ Star Wars?'), 'i');
    assert.ok(pattern.test('(.*)+ star wars?'));
    assert.equal(pattern.test('anything'), false);
  });
});
