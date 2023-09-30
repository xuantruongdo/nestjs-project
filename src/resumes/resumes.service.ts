import { Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ResumesService {

  constructor(@InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>){ }
  async create(createUserCvDto: CreateUserCvDto, user: IUser) {

    let newResume = await this.resumeModel.create({
      ...createUserCvDto,
      userId: user._id,
      status: "PENDING",
      createdBy: {
        _id: user._id,
        email: user.email
      },
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ]
    })
    return {
      _id: newResume?._id,
      createdAt: newResume?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
      .populate([
        { path: "userId", select: { _id: 1, email: 1 } },
        { path: "jobId", select: { _id: 1, name: 1 } },
        { path: "companyId", select: { _id: 1, name: 1, logo: 1 } }
    ])
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

  async findOne(_id: string) {
    return await this.resumeModel.findOne({ _id })
  }

  async update(_id: string, status: string, user: IUser) {
    return await this.resumeModel.updateOne({ _id }, {
      status,
      updatedBy: {
        _id: user._id,
        email: user.email
      },
      $push: {
        history: {
          status,
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      }
    })
  }

  async remove(_id: string, user: IUser) {
    await this.resumeModel.updateOne({ _id }, {
      deletedBy: {
        _id: user._id,
        email: user.email 
      }
    })
    return this.resumeModel.softDelete({_id});
  }

  async findResumesByUserId(userId: string) {
    return await this.resumeModel.find({ userId }).populate([
      { path: "companyId", select: { _id: 1, name: 1 } },
      { path: "jobId", select: { _id: 1, name: 1 } }
    ]);
  }

  async getCount() {
    const count = await this.resumeModel.countDocuments({ isDeleted: false });
    return count;
  }
}
