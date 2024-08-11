import { Basic } from 'src/core/entities/basic.entitiy';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class Comment extends Basic {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;
}
