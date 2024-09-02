import { Exclude, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class SearchPostsQueryDto {
  @IsString()
  @IsOptional()
  query?: string;
}

class UserDto extends User {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updateAt: Date;
}

export class ResponsePostsQueryDto {
  id: string;
  createdAt: string;
  is_public: boolean;
  title: string;
  description: string;
  @Type(() => UserDto)
  user: UserDto;
}
