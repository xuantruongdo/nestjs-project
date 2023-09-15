import { BadRequestException, Injectable } from '@nestjs/common';
import { ChangePasswordDto, CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, User as UserM } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { email, password, fullname, age, gender, address, role, company } = createUserDto;
    
    const isExist = await this.userModel.findOne({ email });

    if (isExist) {
      throw new BadRequestException("Email đã tồn tại")
    }

    const hashPassword = this.getHashPassword(createUserDto.password);

    let newUser = await this.userModel.create({
      email, fullname, age, gender, address, role, company,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return newUser;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate({path: 'role', select: {_id: 1, name: 1 }})
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
    return await this.roleModel.findOne({
      _id: id
    }).populate({ path: "permissions", select: { _id: 1, name: 1, apiPath: 1, method: 1, module: 1 } })
  }

  findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async register (user: RegisterUserDto) {
    const { email, password, fullname, age, gender, address } = user;

    const isExist = await this.userModel.findOne({ email })
    
    if (isExist) {
      throw new BadRequestException("Email đã tồn tại")
    }

    const userRole = await this.roleModel.findOne({ name: USER_ROLE})
    const hashPassword = this.getHashPassword(password);

    let newRegister = await this.userModel.create({
      email, fullname, age, gender, address,
      password: hashPassword,
      role: userRole
    })

    return newRegister;
  }

  async update(_id: string, updateUserDto: UpdateUserDto, user: IUser) {
    let updated = await this.userModel.updateOne({ _id }, {
      ...updateUserDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    })
    let userUpdated = (await this.userModel.findOne({ _id })
    .populate({ path: "role", select: { _id: 1, name: 1 } })
    .select('_id email fullname age gender address role'))
    return {
      updated,
      userUpdated
    };
  }

  async changePassword(_id: string, changPasswordDto: ChangePasswordDto, user: IUser) {
    const { current_password, new_password, confirm_password } = changPasswordDto;
    if (new_password !== confirm_password) {
      throw new BadRequestException('Xác nhận mật khẩu không khớp.');
    }
    let userCurrent = await this.userModel.findOne({ _id });
    let isValid = this.isValidPassword(current_password, userCurrent.password);
    if (isValid) {
      const hashPassword = this.getHashPassword(new_password);
      let updated = await this.userModel.updateOne({ _id }, {
        password: hashPassword
      })
      return updated;
    } else {
      throw new BadRequestException('Mật khẩu không chính xác.');
    }
  }


  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    )
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne(
      {refreshToken}
    )
  }
}
