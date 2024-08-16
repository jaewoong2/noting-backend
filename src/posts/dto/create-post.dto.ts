// src/users/dto/create-user.dto.ts
import { IsObject, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  description: string;

  @IsString()
  messageId: string;

  @IsObject()
  user: CreateUserDto;
}
