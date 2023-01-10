import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import HttpException from '../exceptions/HttpException';
import { isEmpty } from '../utils/util';
import { CalendarEntity } from '../entity/calendar.entity';
import { UserMonthData } from '../interfaces/calendar.interface';

//const calendar: User[] = await calendarRepository.find();

class CalendarService {
  
  public calendar = CalendarEntity;

  public async getAllData(): Promise<UserMonthData[]> {
    let fields = ["calendar.id", "calendar.month"]
    for(let i = 1; i < 32; i++){
        fields.push("calendar." + i)
    }
    const calendar = await getRepository(CalendarEntity)
    .createQueryBuilder("calendar")
    .select(fields)
    .getMany()
    return calendar;
  }

  public async findCalendarById(userId: number): Promise<UserMonthData> {
    const calendarRepository = getRepository(this.calendar);
    const findCalendar: UserMonthData = await calendarRepository.findOne({ where: { id: userId } });
    if (!findCalendar) throw new HttpException(409, "You're not user");

    return findCalendar;
  }

  public async createCalendar() {
    console.log('userId');
    console.log('calendarData');
    
    
    // if (isEmpty(calendarData)) throw new HttpException(400, "You're not calendarData");

    // const calendarRepository = getRepository(this.calendar);
    // const findCalendar: UserMonthData = await calendarRepository.findOne({ where: { month: calendarData.month } });
    // if (findCalendar) throw new HttpException(409, `You're email ${calendarData.email} already exists`);

    // const hashedPassword = await bcrypt.hash(calendarData.password, 10);
    // const createcalendarData: UserMonthData = await calendarRepository.save({ ...calendarData, password: hashedPassword });

    // return createcalendarData;
  }

  public async updateCalendar(userId: number, calendarData): Promise<UserMonthData> {
    const calendarRepository = getRepository(this.calendar);

    const response: UserMonthData = await calendarRepository.findOne({ where: { month: calendarData.month } });
    return response
  }
}

export default CalendarService;
