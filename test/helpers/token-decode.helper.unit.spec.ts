import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { decodeJwtFromRequest } from '@src/shared/helpers/token-decode.helper';

jest.mock('jsonwebtoken');

describe('decodeJwtFromRequest', () => {
  const mockRequest = (authorization?: string): Request =>
    ({
      headers: authorization ? { authorization } : {},
    }) as Request;

  const mockSecret = 'myIntrestingSecretKey';
  process.env.JWT_SECRET = mockSecret;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if authorization header is missing', () => {
    const req = mockRequest();
    expect(decodeJwtFromRequest(req)).toBeNull();
  });

  it('should return the decoded token if valid', () => {
    const token = 'validToken';
    const decodedPayload = { userId: 1, email: 'testUser@gmail.com' };
    (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

    const req = mockRequest(`Bearer ${token}`);
    expect(decodeJwtFromRequest(req)).toEqual(decodedPayload);
    expect(jwt.verify).toHaveBeenCalledWith(token, mockSecret);
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    const token = 'invalidToken';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = mockRequest(`Bearer ${token}`);

    expect(() => decodeJwtFromRequest(req)).toThrow(UnauthorizedException);
    expect(jwt.verify).toHaveBeenCalledWith(token, mockSecret);
  });

  it('should throw UnauthorizedException if authorization header is malformed', () => {
    const req = mockRequest('InvalidHeaderFormat');

    expect(() => decodeJwtFromRequest(req)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if JWT_SECRET is undefined', () => {
    delete process.env.JWT_SECRET; // Remove o secret para testar a falha
    const token = 'validToken';
    const req = mockRequest(`Bearer ${token}`);

    expect(() => decodeJwtFromRequest(req)).toThrow(UnauthorizedException);
  });
});
