import { Entity, ObjectIdColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, ObjectID, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { User } from '../interfaces/users.interface';
import { RefreshTokenEntity } from './token.entity';

@Entity()
@Unique(['email'])
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(()=> RefreshTokenEntity)
  @JoinColumn()
  refreshToken: RefreshTokenEntity

}
