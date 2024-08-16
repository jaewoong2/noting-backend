// src/users/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  avatar?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  userName?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
