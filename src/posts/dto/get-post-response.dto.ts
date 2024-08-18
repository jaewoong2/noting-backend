import { Exclude, Type } from 'class-transformer';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { FindUserTagResponseDto } from 'src/tags/dto/find-users-tag.dto';
import { Tag } from 'src/tags/entities/tag.entity';
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
  is_public: boolean;
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
  @Type(() => Tag)
  tags: FindUserTagResponseDto[];
}

export class CreatePostResponseDto {
  data: {
    id: string;
  };
}
