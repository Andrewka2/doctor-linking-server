import { Entity, ObjectIdColumn, Column, Unique, ObjectID, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { User } from '../interfaces/users.interface';
import { UserEntity } from './users.entity';

@Entity()
@Unique(['refreshToken'])
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  refreshToken: string;

  @OneToOne( () => UserEntity )
  @JoinColumn()
  user: UserEntity;
}
