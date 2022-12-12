import { getRepository } from 'typeorm';
import { CreateUserDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { User } from '../interfaces/users.interface';
import { UserEntity } from '../entity/users.entity';
import { isEmpty } from '../utils/util';
import { RequestEntity } from '../entity/request.entity';
import axios from 'axios';
import { NotificationEntity } from '../entity/notification.entity';

//const users: User[] = await userRepository.find();

class RequestService {
  
  public users = UserEntity;
  public requests = RequestEntity

  public async setRequest( data:any ){
    console.log(data)
    const userRepository = getRepository(this.users);
    const findUser: User = await userRepository.findOne({ where: { id: Number(data.petitionerId) } });
    if (!findUser) throw new HttpException(409, "You're not user");
    const requestsRepository = getRepository(this.requests);
    const {requestData, petitionerId, petitioner, personalType, position, dateTime} = data;
    //const request = await requestsRepository.save({ requestData, petitionerId, petitioner, personalType, position, isAssigned: false, dateTime });

    //можливо додати додаткові перевірки ??

    const users = await getRepository(UserEntity)
    .createQueryBuilder("user")
    .where('user.position = :position', {position: 'Cleaner'})
    .select(["user.id"])
    .getMany()

    users.map(async (elem:any,i)=>{
        const user = await userRepository.findOne({ relations: { notification: true }, where: { id: elem.id } })
        await axios.post('https://fcm.googleapis.com/fcm/send', {
        notification: {
            title: "test",
            body: "Test message",
            click_action: "http://localhost:3001/"
        },
        to: user.notification.key 
    }, {
        headers: {
            'Authorization': 'key=AAAAzcQQ2-c:APA91bHSq1KYQxtviNZ2YyqrNdk8k5_WIIAyWrwkM0_I6-4l8HcvqMTwFIXE7Sw6gbGvus6B5WIq5EZM9wF9Xx4AnzJB22HwMI817s76TWjqETGcs98P7YpF4YA1t6UrjRlmH-urQ-jq',
            'Content-Type': 'application/json;charset=UTF-8',
        }
    })
    })   
  }

}

export default RequestService;
