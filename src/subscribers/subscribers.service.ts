import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Subcriber, SubcriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class SubscribersService {

  constructor(@InjectModel(Subcriber.name) private subscriberModel: SoftDeleteModel<SubcriberDocument>) { }

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {

    const { name, email, skills } = createSubscriberDto;

    const isExist = await this.subscriberModel.findOne({ email });

    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống`);
    }

    const newSubscriber = await this.subscriberModel.create({
      name,  email, skills,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newSubscriber?._id,
      createdAt: newSubscriber?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .select(projection as any)
    .populate(population)
    .exec();
    
    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    return await this.subscriberModel.findOne({
      _id: id
    })
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    const updated = await this.subscriberModel.updateOne({ email: user.email }, {
      ...updateSubscriberDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    }
    );

    return updated;
  }
  async remove(id: string, user: IUser) {
    await this.subscriberModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email 
      }
    })
    return this.subscriberModel.softDelete({_id: id});
  }

  async getSkills(user: IUser) {
    return await this.subscriberModel.findOne({email: user.email})
  }
}
