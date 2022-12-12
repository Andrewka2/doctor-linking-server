import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public name?: string;

  @IsString()
  public surname?: string;

  @IsString()
  public position?: string;

  @IsString()
  public phone?: string;

  @IsString()
  public password: string;
}

export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}

