import crypto from 'node:crypto';

export function encryptPassword(password: string) {
  const hash = crypto.createHash('sha256');
  hash.update(password);

  return hash.digest('hex');
}
