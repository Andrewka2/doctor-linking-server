import { Entity, Column, Unique, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from './users.entity';

@Entity()
export class RequestEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  @IsNotEmpty()
  requestData: string;

  @Column()
  @IsNotEmpty()
  petitionerId: string;

  @Column()
  @IsNotEmpty()
  petitioner: string;

  @Column()
  @IsNotEmpty()
  personalType: string;

  @Column()
  @IsNotEmpty()
  position: string;

  @Column()
  @IsNotEmpty()
  isAssigned: boolean;

  @Column()
  @IsNotEmpty()
  dateTime: Date;

  @OneToOne( () => UserEntity )
  @JoinColumn()
  user: UserEntity;
}
