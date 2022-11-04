import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '../dtos/users.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
import { User, UserRegistration } from '../interfaces/users.interface';
import AuthService from '../services/auth.service';

class AuthController {
  public authService = new AuthService();

  public test = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
      const cookies = req.cookies;
      console.log(cookies)
    }catch(error){
      next(error)
    }
  }

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
      const userData: CreateUserDto = req.body;
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
  public refresh = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const {refreshToken} = req.cookies;
    const { tokens, user } = await this.authService.refresh(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true
    })
    res.status(200).json({ tokens, user,  message: 'refresh' });
  }
}

export default AuthController;
