import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '@src/users/dtos/create-user.dto';
import { CreateUserMapper } from '@src/users/mappers/create-user.mapper';
import { IUserRepository } from '@src/users/interfaces/user.repository.interface';
import { UpdateUserDto } from '@src/users/dtos/update-user.dto';
import { UpdateUserPasswordWithEmailDto } from '@src/users/dtos/update-password-with-email.dto';
import { UserModuleAlias } from '@src/users/constants/alias';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserModuleAlias.USER_REPOSITORY_ALIAS)
    private readonly userRepository: IUserRepository,
    private readonly createUserMapper: CreateUserMapper,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    if (!createUserDto.isTermsAccepted) {
      throw new ConflictException('Terms not accepted');
    }

    const existingUser = await this.userRepository.findUserByEmail(
      createUserDto.email,
      false,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists!');
    }

    const user = await this.userRepository.createUser(createUserDto);

    return this.createUserMapper.map(user);
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException('user not found!');
    }

    return user;
  }

  async updateUserPassword(
    updateUserPasswordDto: UpdateUserPasswordWithEmailDto,
  ) {
    const { confirmPassword, password, email } = updateUserPasswordDto;
    if (confirmPassword !== password) {
      throw new ConflictException('Both passwords need to be the same!');
    }

    const user = await this.userRepository.findUserByEmail(
      email as string,
      false,
    );

    if (!user) {
      throw new ConflictException('User Not found!');
    }

    await this.userRepository.save({
      ...user,
      password,
    });

    return {
      message: 'User password updated successfully!',
      mensagem: 'Senha do usuário atualizada com sucesso!',
    };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const { name, phoneNumber } = updateUserDto;

    const user = await this.findUserById(userId);

    if (name) {
      user.name = name;
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    return this.userRepository.save(user);
  }

  async userProfile(id: string) {
    const user = await this.userRepository.findUserById(id);

    if (!user) {
      throw new ConflictException('User not found!');
    }

    return user;
  }
}
