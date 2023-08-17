import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, User as UserM } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';

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

  findAll(user: IUser) {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
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

    const userRole = await this.roleModel.findOne({ name: ""})
    const hashPassword = this.getHashPassword(password);

    let newRegister = await this.userModel.create({
      email, fullname, age, gender, address,
      password: hashPassword
    })

    return newRegister;
  }



  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
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
