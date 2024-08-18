import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';

export class FindUsersTagQueryDto {
  @IsString()
  userId: string;
}

export class FindUserTagResponseDto {
  @Exclude()
  createdAt: string;

  @Exclude()
  updateAt: string;

  @IsString()
  name?: string;
}
