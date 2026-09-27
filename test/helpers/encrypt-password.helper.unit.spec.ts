import { encryptPassword } from '@src/shared/helpers/password.helper';

describe('encryptPassword', () => {
  it('should return a SHA-256 hashed password', () => {
    const password = 'thisIsAIntrestingPassword';
    const hashedPassword = encryptPassword(password);

    // Verifica se o hash tem 64 caracteres.
    expect(hashedPassword).toHaveLength(64);

    // Verifica se a mesma senha gera sempre o mesmo hash.
    const hashedAgain = encryptPassword(password);
    expect(hashedPassword).toBe(hashedAgain);

    // Verifica se senhas diferentes geram hashes diferentes.
    const differentPassword = 'anotherIntrestingPassword';
    const differentHash = encryptPassword(differentPassword);
    expect(hashedPassword).not.toBe(differentHash);
  });

  it('should hash an empty string', () => {
    const hashedEmpty = encryptPassword('');
    expect(hashedEmpty).toHaveLength(64);
  });
});
