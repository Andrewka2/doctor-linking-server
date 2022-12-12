import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, LoginUserDto } from '../dtos/users.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
import { User, UserRegistration } from '../interfaces/users.interface';
import { Doctor } from '../interfaces/doctor.interface';
import AuthService from '../services/auth.service';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const {tokens, user} = await this.authService.signup(userData);

      res.cookie('refreshToken', tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
      })
      res.status(201).json({ userData: user, tokens: tokens, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { 
      const userData: LoginUserDto = req.body;
      const { tokens, user } = await this.authService.login(userData);
      res.cookie('refreshToken', tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
      })
      res.status(200).json({ data: user, tokens, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: UserRegistration = req.user;
      const {refreshToken} = req.cookies;
      const logOutUserData: User = await this.authService.logout(userData, refreshToken);
      res.clearCookie('refreshToken')
      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };
  public doctorSignUp = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const {refreshToken} = req.cookies;
      const doctorData: User = await this.authService.doctorSignUp(userData, refreshToken);
      res.status(200).json({ data: doctorData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };
  public refresh = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try{
      const {refreshToken} = req.cookies;
      const { tokens, user } = await this.authService.refresh(refreshToken);
      res.cookie('refreshToken', tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
      })
      res.status(200).json({ tokens, user,  message: 'refresh' });
    }catch(error){
      next(error)
    }
  }
  public capcha = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try{
      const {secret} = req.body
      await this.authService.capcha(secret);
      res.status(200).json({message: 'verified'});
    }catch(error){
      next(error)
    }
  }
  public verify = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try{
      const id = req.query.id
      console.log(id)
      await this.authService.verify(id);
      res.status(200).redirect('http://localhost:3000/login')
    }catch(error){
      next(error)
    }
  }
  public notification = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try{
      const {key} = req.body;
      const {id} = req.user;
      await this.authService.notification(key, id);
      res.status(200)
    }catch(error){
      next(error)
    }
  }
}

export default AuthController;
