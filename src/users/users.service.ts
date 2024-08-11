// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(
    userId: string,
    options?: Omit<FindOneOptions<User>, 'where'>,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      ...options,
    });

    return user;
  }

  async createUser(user: CreateUserDto) {
    const newUser = this.userRepository.create();

    newUser.avatar = user.avatar;
    newUser.userName = user.userName;
    newUser.email = user.email;

    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        return await transactionalEntityManager.save(newUser, {
          reload: false,
        });
      },
    );
  }

  async findOrCreateUser(
    { email, avatar, userName }: User,
    transactionEntityManager: EntityManager,
  ) {
    const currentUser = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!currentUser) {
      const user = transactionEntityManager.create(User);

      user.avatar = avatar;
      user.userName = userName;
      user.email = email;

      return transactionEntityManager.save(user);
    }

    return currentUser;
  }

  async findOneByUserName(userName: string) {
    const user = await this.userRepository.findOne({ where: { userName } }); // Reuse the findOneUser method to include error handling
    return user;
  }

  async updateUser(userName: string, updateUser: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userName } }); // Reuse the findOneUser method to include error handling
    const updatedUser = Object.assign(user, updateUser);
    return this.userRepository.save(updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  }
}
