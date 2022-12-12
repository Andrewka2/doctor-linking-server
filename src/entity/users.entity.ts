import { Entity, ObjectIdColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, ObjectID, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { User } from '../interfaces/users.interface';
import { RefreshTokenEntity } from './token.entity';
import { RequestEntity } from './request.entity';
import { NotificationEntity } from './notification.entity';

@Entity()
@Unique(['email', 'id', 'phone'])
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  surname: string;

  @Column()
  @IsNotEmpty()
  position: string;

  @Column()
  @IsNotEmpty()
  phone: string;

  @Column()
  @IsNotEmpty()
  role: string;

  @Column()
  @IsNotEmpty()
  isTemporary: boolean;

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

  @OneToOne(()=> RequestEntity)
  @JoinColumn()
  doctorRequest: RequestEntity

  @OneToOne( () => NotificationEntity )
  @JoinColumn()
  notification: NotificationEntity;

}
