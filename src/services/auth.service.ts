import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CreateUserDto, LoginUserDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import { User, UserRegistration } from '../interfaces/users.interface';
import { UserEntity } from '../entity/users.entity';
import { isEmpty } from '../utils/util';
import { RefreshTokenEntity } from '../entity/token.entity';
import { getRepository } from 'typeorm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import generator from 'generate-password'
import { NotificationEntity } from '../entity/notification.entity';

class AuthService {
  public users = UserEntity;
  public refreshTokenEntity = RefreshTokenEntity;
  public notifications = NotificationEntity

  public async notification(key: string, id:number){
    const userRepository = getRepository(this.users);
    const notificationRepository = getRepository(this.notifications)
    const user = await userRepository.findOne({ relations: { notification: true }, where: { id: id } })
    if (!user) throw new HttpException(409, `You're not user`);
    const isKey = await notificationRepository.findOne({where: {key: key}})
    if(isKey){
      return
    }
    if(!user.notification){
      const notification = await notificationRepository.save({ key, user: user });
      await userRepository.update({
        id: id
      }, {
        notification: notification 
      })
    }
    await notificationRepository.update({
      id: user.notification.id
    },{
      key: key
    })
  }

  public async sendMail(mail, password, url) {
    try {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: 'andriikatsalap@gmail.com',
          pass: 'dkjnrgevbiulpemv',
        },
      });
      const mailOptions = {
        from: 'andriikatsalap@gmail.com',
        to: mail, 
        subject: "Hello ✔", // Subject line
        //text: `Hello world! this is password ${password}`, // plain text body
        html: `<b>Temporary password is ${password}</b><br></br>
          <b>Your invitation link is here ${url}</b>`, // html body
      }
      let info = await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent: ' + info.response)
        }
      });
    } catch (e) {
      console.log(e)
    }
  }

  public async signup(userData: CreateUserDto): Promise<{ tokens: { refreshToken: string, accessToken: string }, user: UserRegistration }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const { email, name, surname, position, phone } = userData;
    const user: User = await userRepository.save({ email, name, surname, position, phone, role: 'admin', isTemporary: false, password: hashedPassword });

    const { id }: UserRegistration = user;

    const tokens = this.createToken({ email, id });

    const savedToken = await this.saveToken(user.id, tokens.refreshToken);

    await userRepository.update({
      id: id
    }, {
      refreshToken: savedToken
    })

    return { tokens, user: { id, email, name, surname, position, phone, isTemporary: false, role: 'admin', } };
  }

  public async login(userData: LoginUserDto): Promise<{ tokens: { refreshToken: string, accessToken: string }, user: UserRegistration }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const userRepository = getRepository(this.users);
    const findUser = await userRepository.findOne({ relations: { refreshToken: true }, where: { email: userData.email  } })
   
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);
    const isPasswordMatching: boolean = await bcrypt.compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");
    
    const { email, name, id, surname, position, phone, isTemporary, role, }: UserRegistration = findUser;
    const tokens = this.createToken({ email, id });
    if (!findUser.refreshToken) {
      const savedToken = await this.saveToken(findUser.id, tokens.refreshToken);
      await userRepository.update({
        id: id
      }, {
        refreshToken: savedToken
      })
    } else {
      await this.saveToken(findUser.id, tokens.refreshToken);
    }
    return { tokens, user: { id, email, name, surname, position, phone, isTemporary, role } };
  }

  public async logout(userData: UserRegistration, refreshToken: string): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { id: userData.id } });
    if (!findUser) throw new HttpException(409, "You're not user");
    await this.removeToken(refreshToken)
    return findUser;
  }

  public async doctorSignUp(userData: CreateUserDto, refreshToken: string): Promise<any> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const usersRepository = getRepository(this.users);
    const findUser = await usersRepository.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    var password = generator.generate({
      length: 10,
      numbers: true
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { email, name, surname, position, phone } = userData;
    const user = await usersRepository.save({ email, name, surname, position, phone, role: 'user', isTemporary: true, password: hashedPassword });
    const { id, createdAt } = user;
    const mail = {
      id: id,
      created: createdAt
    }
    const token_user_verification = jwt.sign(mail, process.env.JWT_VERIFY_SECRET, { expiresIn: '1d' });
    const url = `${process.env.DEFAULT_ADRESS}/` + "verify?id=" + token_user_verification;
    await this.sendMail(email, password, url);
    
    return { user: { email, id, name } };
  }

  public async refresh(refreshToken: string): Promise<{ tokens: { refreshToken: string, accessToken: string }, user: UserRegistration }> {
    const userRepository = getRepository(this.users)
    if (!refreshToken) throw new HttpException(400, "You're not userData")
    const userData: any = await this.validateRefreshToken(refreshToken)
    const tokenFromDb = await this.findToken(refreshToken)
    if (!userData || !tokenFromDb) throw new HttpException(404, "You're not authorized")
    const user = await userRepository.findOne({ where: { id: userData.id } })
    const { email, name, id, surname, position, phone, isTemporary, role }: UserRegistration = user
    const tokens = this.createToken({ email, id })
    await this.saveToken(user.id, tokens.refreshToken, refreshToken)
    return {
      tokens, user: {
        id,
        email,
        name,
        surname,
        position,
        phone,
        isTemporary,
        role
      }
    }
  }

  public async capcha(secret: string) {
    if (!secret) throw new HttpException(400, "You're not userData")
    let response = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${secret}`)
    if (!response.data.success) throw new HttpException(400, "Something went wrong")
  }

  public async verify(id: any) {
    console.log(id)
    if (!id) throw new HttpException(400, "You're not userData")
    if (id) {
      try {
        jwt.verify(id, process.env.JWT_VERIFY_SECRET, (e, decoded) => {
          if (e) {
            console.log(e)
            throw new HttpException(403, "You're not userData")
          } else {
            let userId = decoded;
            console.log(userId)
            //Додати в базу прапорець верифікації і оновити його тут 
          }

        });
      } catch (err) {
        console.log(err)
        throw new HttpException(403, "You're not userData")
      }
    }
  }

  public createToken(user): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id, email: user.email };
    const refreshSecret: string = process.env.JWT_REFRESH_SECRET;
    const accessSecret: string = process.env.JWT_ACCESS_SECRET;
    const refreshToken = jwt.sign(dataStoredInToken, refreshSecret, { expiresIn: '30d' })
    const accessToken = jwt.sign(dataStoredInToken, accessSecret, { expiresIn: '30m' })
    return { refreshToken, accessToken };
  }

  public async saveToken(userId, refreshToken, oldRefreshToken?) {
    const tokenEntityRepository = getRepository(this.refreshTokenEntity)
    const userRepository = getRepository(this.users)
    const user = await userRepository.findOne({ relations: { refreshToken: true }, where: { id: userId } })
    const tokenWithUser = await this.findToken(oldRefreshToken)
    if (user.refreshToken) {
      await tokenEntityRepository.update({
        id: user.refreshToken.id
      }, {
        refreshToken: refreshToken
      })
      return tokenWithUser
    }
    const token = await tokenEntityRepository.save({
      refreshToken
    })
    return token;
  }

  public async removeToken(refreshToken) {
    const tokenEntityRepository = getRepository(this.refreshTokenEntity)
    const userRepository = getRepository(this.users)
    const userData: any = await this.validateRefreshToken(refreshToken)
    const user = await userRepository.findOne({ relations: { refreshToken: true }, where: { id: userData.id } })
    const tokenData = await tokenEntityRepository.findOne({ where: { refreshToken: refreshToken } })
    let result = await userRepository.update({
      id: user.id
    }, {
      refreshToken: {
        id: tokenData.id,
        refreshToken: null
      }
    })
    return result
  }

  public async validateAccessToken(token) {
    const userData = await jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    if (!userData) {
      return null
    } else {
      return userData
    }
  }
  public async validateRefreshToken(token) {
    const userData = await jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    if (!userData) {
      return null
    } else {
      return userData
    }
  }
  public async findToken(token) {
    const tokenEntityRepository = getRepository(this.refreshTokenEntity)
    const tokenData = await tokenEntityRepository.findOne({ where: { refreshToken: token } })
    return tokenData
  }
}

export default AuthService;
