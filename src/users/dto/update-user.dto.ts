import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto, RegisterUserDto } from './create-user.dto';

export class UpdateUserDto extends OmitType(RegisterUserDto, ['password', 'email'] as const) {
    _id: string;
}  
  
export class UpdateUserByAdminDto extends OmitType(CreateUserDto, ['password', 'email'] as const) {
  _id: string;
}  
