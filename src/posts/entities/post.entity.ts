import {
  Entity,
  Column,
  ManyToOne,
  JoinTable,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Basic } from 'src/core/entities/basic.entitiy';
import { Comment } from 'src/comments/entities/comment.entity';
import { Tag } from 'src/tags/entities/tag.entity';

@Entity()
export class Post extends Basic {
  @Column({ unique: true })
  messageId: string;

  @Column({ default: true })
  is_public: boolean;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true, default: null })
  order: number;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  user: User;

  @OneToMany(() => Like, (like) => like.post, { cascade: true, nullable: true })
  @JoinTable()
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
    nullable: true,
  })
  comments: Comment[];

  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable()
  tags: Tag[]; // 태그와의 다대다 관계 설정
}
