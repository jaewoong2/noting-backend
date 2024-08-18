import { Controller, Get, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  FindUsersTagQueryDto,
  FindUserTagResponseDto,
} from './dto/find-users-tag.dto';

@Controller('api/tags')
@ApiTags('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOkResponse({ type: FindUserTagResponseDto })
  @ApiOperation({ summary: '유저가 저장한 대화의 모든 카테고리를 가져옵니다.' })
  findAll(@Query() query: FindUsersTagQueryDto) {
    return this.tagsService.findAllUserTags(query.userId);
  }
}
