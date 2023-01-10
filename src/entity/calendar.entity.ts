import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from './users.entity';
import { UserMonthData } from '../interfaces/calendar.interface';

@Entity()
export class CalendarEntity implements UserMonthData {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne( () => UserEntity )
  @JoinColumn()
  user: UserEntity;
  
  @Column()
  @IsNotEmpty()
  month: string;
  
  @Column()
  1: string;
  
  @Column()
  2: string;
  
  @Column()
  3: string;
  
  @Column()
  4: string;
  
  @Column()
  5: string;
  
  @Column()
  6: string;
  
  @Column()
  7: string;
  
  @Column()
  8: string;
  
  @Column()
  9: string;
  
  @Column()
  10: string;
  
  @Column()
  11: string;
  
  @Column()
  12: string;
  
  @Column()
  13: string;
  
  @Column()
  14: string;
  
  @Column()
  15: string;
  
  @Column()
  16: string;
  
  @Column()
  17: string;
  
  @Column()
  18: string;
  
  @Column()
  19: string;
  
  @Column()
  20: string;
  
  @Column()
  21: string;
  
  @Column()
  22: string;
  
  @Column()
  23: string;
  
  @Column()
  24: string;
  
  @Column()
  25: string;
  
  @Column()
  26: string;
  
  @Column()
  27: string;
  
  @Column()
  28: string;
  
  @Column()
  29: string;
  
  @Column()
  30: string;
  
  @Column()
  31: string;
}
