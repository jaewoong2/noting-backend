import { Entity, Column, ManyToMany } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { Basic } from 'src/core/entities/basic.entitiy';

@Entity()
export class Tag extends Basic {
  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}
