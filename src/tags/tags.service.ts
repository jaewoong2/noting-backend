import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findOrCreateTag(tagName: string): Promise<Tag> {
    // 먼저 태그가 존재하는지 확인
    let tag = await this.tagRepository.findOne({ where: { name: tagName } });

    // 태그가 없으면 새로 생성
    if (!tag) {
      tag = this.tagRepository.create({ name: tagName });
      await this.tagRepository.save(tag);
    }

    // 태그 반환
    return tag;
  }
}
