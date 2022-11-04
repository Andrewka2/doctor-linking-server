import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CreateUserDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import { User, UserRegistration } from '../interfaces/users.interface';
import { UserEntity } from '../entity/users.entity';
import { isEmpty } from '../utils/util';
import { AppDataSource } from '../database';
import { RefreshTokenEntity } from '../entity/token.entity';
import { getRepository } from 'typeorm';

class AuthService {
  public users = UserEntity;
  public refreshTokenEntity = RefreshTokenEntity;

  public async signup(userData: CreateUserDto): Promise<{ tokens: { refreshToken: string, accessToken: string }, user: UserRegistration }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const userRepository = getRepository(this.users);

    const findUser: User = await userRepository.findOne({ where: { email: userData.email } });
 
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);
  
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const { email, password } = userData;
  
    const user: User = await userRepository.save({ email, password: hashedPassword });
  
    const { id }: UserRegistration = user;
  
    const tokens = this.createToken({email, id});
  
    const savedToken = await this.saveToken(user.id, tokens.refreshToken);
    
    let created = await userRepository.update({
      id: id
    }, {
      refreshToken: savedToken
    })
     
    
    
    return { tokens, user: { email, id } };
  }

  public async login(userData: CreateUserDto): Promise<{ tokens: { refreshToken: string, accessToken: string }, user: UserRegistration }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { email: userData.email } });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);
    const isPasswordMatching: boolean = await bcrypt.compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");
    const { email, id }: UserRegistration = findUser
    const tokens = this.createToken({email, id})
    await this.saveToken(findUser.id, tokens.refreshToken)
    return { tokens, user: { email, id } };
  }

  public async logout(userData: UserRegistration, refreshToken: string): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { password: userData.password } });
    if (!findUser) throw new HttpException(409, "You're not user");
    console.log(1)
    const result = await this.removeToken(refreshToken)
    console.log(result)
    return findUser;
  }

  public async refresh(refreshToken: string):Promise<{ tokens: { refreshToken: string, accessToken: string }, user: UserRegistration }> {
    try {
      console.log(refreshToken)
      const userRepository = getRepository(this.users)
      if (!refreshToken) throw new HttpException(400, "You're not userData")
      const userData:any = await this.validateRefreshToken(refreshToken)
      const tokenFromDb  = await this.findToken(refreshToken)
      if(!userData || !tokenFromDb) throw new HttpException(404, "You're not authorized")
      const user = await userRepository.findOne({ where: { id: userData.id}  })
      const { email, id }: UserRegistration = user
      const tokens = this.createToken({email, id})
      await this.saveToken(user.id, tokens.refreshToken, refreshToken)   
      return {tokens, user: {
        email,
        id
      }}
    }catch(e){
      console.log(e)
    }
    
  }

  public createToken(user: UserRegistration): TokenData {
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
    const user = await userRepository.findOne({ relations:{ refreshToken: true }, where: { id: userId } })
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
    const userData:any = await this.validateRefreshToken(refreshToken)
    const user = await userRepository.findOne({ relations:{ refreshToken: true }, where: { id: userData.id } })
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
  public async findToken(token){
    const tokenEntityRepository = getRepository(this.refreshTokenEntity)
    const tokenData = await tokenEntityRepository.findOne({ where: { refreshToken: token } })
    return tokenData
  }
}

export default AuthService;
