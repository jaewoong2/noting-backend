import { Entity, Column, OneToMany } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Basic } from 'src/core/entities/basic.entitiy';
import { Comment } from 'src/comments/entities/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User extends Basic {
  @ApiProperty()
  @Column()
  avatar: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true })
  userName: string;

  @ApiProperty()
  @Column({ nullable: true })
  provider?: 'google' | 'kakao' | 'naver' | 'email';

  @ApiProperty()
  @OneToMany(() => Post, (post) => post.user, { cascade: true })
  posts: Post[];

  @ApiProperty()
  @OneToMany(() => Like, (like) => like.user, { cascade: true })
  likes: Like[];

  @ApiProperty()
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
