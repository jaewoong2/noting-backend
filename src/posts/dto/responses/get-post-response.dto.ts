import { ApiProperty } from '@nestjs/swagger';
import { ResponseFormat } from 'src/core/dto/response-format.dto';
import { PageMetaDto } from '../page-meta.dto';

export abstract class GetPostResponseData {
  @ApiProperty()
  id: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updateAt: string;
  @ApiProperty()
  messageId: string;
  @ApiProperty()
  is_public: boolean;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  order: any;
  @ApiProperty()
  user: {
    id: string;
    avatar: string;
    email: string;
    userName: string;
    provider: any;
  };
  @ApiProperty()
  likes: any[];
  @ApiProperty()
  comments: any[];
}

export abstract class GetPostResponse extends ResponseFormat<{
  data: GetPostResponseData[];
  meta: PageMetaDto;
}> {
  constructor() {
    super();
  }

  data: { data: GetPostResponseData[]; meta: PageMetaDto };
}
