// src/users/dto/create-user.dto.ts
import { IsObject, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  messageId: string;

  @IsObject()
  user: User;
}
