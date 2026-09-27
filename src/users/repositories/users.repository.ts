import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/users/entities/user.entity';
import { Repository } from 'typeorm';

export type CreateUserData = Omit<Partial<UserEntity>, 'isTermsAccepted'> & {
  isTermsAccepted: boolean | string;
};

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findUserByEmail(
    email: string,
    findPassword: boolean = false,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        password: findPassword,
        emailValidatedAt: true,
        isActivated: true,
      },
    });
  }

  async createUser(userData: CreateUserData): Promise<UserEntity> {
    return this.userRepository.save({
      ...userData,
      isTermsAccepted: Boolean(userData.isTermsAccepted),
    });
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }
}
