import { Controller } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('tags')
@ApiTags('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}
}
