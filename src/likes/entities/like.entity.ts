import { Basic } from 'src/core/entities/basic.entitiy';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class Like extends Basic {
  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: 'CASCADE',
  })
  user: User;
}
