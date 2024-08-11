import { Exclude, Type } from 'class-transformer';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { User } from 'src/users/entities/user.entity';

class UserDto extends User {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updateAt: Date;
}

class LikeDto extends Like {
  @Exclude()
  createdAt: Date;
  @Exclude()
  updateAt: Date;
}

export class GetPostResponseDto {
  id: string;
  createdAt: string;
  updateAt: string;
  title: string;
  description: string;
  order: number;
  @Type(() => UserDto)
  user: UserDto;
  @Type(() => LikeDto)
  likes: LikeDto[];
  @Type(() => Comment)
  comments: Comment[];
}
