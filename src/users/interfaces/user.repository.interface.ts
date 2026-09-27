import { UserEntity } from '@src/users/entities/user.entity';
import { CreateUserData } from '@src/users/repositories/users.repository';

export interface IUserRepository {
  findUserById(id: string): Promise<UserEntity | null>;

  findUserByEmail(
    email: string,
    findPassword: boolean,
  ): Promise<UserEntity | null>;

  createUser(userData: CreateUserData): Promise<UserEntity>;

  save(user: UserEntity): Promise<UserEntity>;
}
