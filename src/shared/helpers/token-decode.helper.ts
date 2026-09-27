import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
ConfigModule.forRoot();

export function decodeJwtFromRequest(req: Request) {
  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    return null;
  }

  const splitedToken = authorizationHeader.split(' ');

  try {
    const secretKey = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(splitedToken[1], secretKey);
    return decoded;
  } catch (error) {
    throw new UnauthorizedException();
  }
}
