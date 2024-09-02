import { ResponseFormat } from 'src/core/dto/response-format.dto';
import { PageMetaDto } from 'src/posts/dto/page-meta.dto';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';

export abstract class GetLikeResponseData {
  post: Post[];
  user: User;
}

export class GetLikeResponseDto {
  post: Post[];
  user: User;
}

export abstract class GetLikeResponse extends ResponseFormat<{
  data: GetLikeResponseData[];
  meta: PageMetaDto;
}> {
  constructor() {
    super();
  }

  data: { data: GetLikeResponseData[]; meta: PageMetaDto };
}
