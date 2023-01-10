import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { User } from '../interfaces/users.interface';
import { UserEntity } from '../entity/users.entity';
import { isEmpty } from '../utils/util';

//const users: User[] = await userRepository.find();

class UserService {
  
  public users = UserEntity;

  public async changePassword(id: string, prevPass: string, newPass: string ){
    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { id: Number(id) } });
    if (!findUser) throw new HttpException(409, "You're not user");
    const isPasswordMatching: boolean = await bcrypt.compare(prevPass, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're not user");
    const hashedPassword = await bcrypt.hash(newPass, 10);
    if(findUser.isTemporary){
      await userRepository.update(Number(id), { isTemporary: false, password: hashedPassword });
    }else{
      await userRepository.update(Number(id), { password: hashedPassword });
    }
  }

  public async findAllUser(): Promise<User[]> {
    const users = await getRepository(UserEntity)
    .createQueryBuilder("user")
    .select(["user.id", "user.email", "user.name", "user.surname", "user.position", "user.phone", "user.role", "user.isTemporary", ])
    .getMany()
    return users;
  }

  public async findUserById(userId: number): Promise<User> {
    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const createUserData: User = await userRepository.save({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async updateUser(userId: number, userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");
//    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await userRepository.update(userId, { ...userData });
    const updateUser: User = await userRepository.findOne({ where: { id: userId } });
    return updateUser;
  }

  public async deleteUser(userId: number): Promise<User> {
    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    await userRepository.delete({ id: userId });
    return findUser;
  }
}

export default UserService;
