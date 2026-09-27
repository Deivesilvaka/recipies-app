import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

Injectable();
export class CreateUserMapper {
  map(user: UserEntity) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      birthdate: user.birthdate,
    };
  }
}
