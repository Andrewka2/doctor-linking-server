import { Entity, ObjectIdColumn, Column, Unique, ObjectID, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from './users.entity';

@Entity()
@Unique(['key'])
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  @IsNotEmpty()
  key: string;

  @OneToOne( () => UserEntity )
  @JoinColumn()
  user: UserEntity;
}
