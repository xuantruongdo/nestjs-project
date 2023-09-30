import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
  }

export class CreateUserDto {
    @IsEmail({}, {
        message: 'Email không đúng định dạng'
    })
    @IsNotEmpty({
        message: 'Email không được để trống'
    })
    email: string;

    @IsNotEmpty({
        message: 'Password không được để trống'
    })
    password: string;

    @IsNotEmpty({
        message: 'Fullname không được để trống'
    })
    fullname: string;

    @IsNotEmpty({
        message: 'Age không được để trống'
    })
    age: string;

    @IsNotEmpty({
        message: 'Gender không được để trống'
    })
    gender: string;

    @IsNotEmpty({
        message: 'Address không được để trống'
    })
    address: string;

    @IsNotEmpty({
        message: 'Role không được để trống'
    })
    @IsMongoId({ message: "Role có định dạng là Mongo Id"})
    role: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company?: Company;
}

export class RegisterUserDto {

    @IsEmail({}, {
        message: 'Email không đúng định dạng'
    })
    @IsNotEmpty({
        message: 'Email không được để trống'
    })
    email: string;

    @IsNotEmpty({
        message: 'Mật khẩu không được để trống'
    })
    password: string;

    @IsNotEmpty({
        message: 'Tên không được để trống'
    })
    fullname: string;

    @IsNotEmpty({
        message: 'Tuổi không được để trống'
    })
    age: string;

    @IsNotEmpty({
        message: 'Giới tính không được để trống'
    })
    gender: string;

    @IsNotEmpty({
        message: 'Địa chỉ không được để trống'
    })
    address: string;
}

export class ChangePasswordDto {

    @IsNotEmpty({
        message: 'Mật khẩu hiện tại không được để trống'
    })
    current_password: string;

    @IsNotEmpty({
        message: 'Mật khẩu mới không được để trống'
    })
    new_password: string;

    @IsNotEmpty({
        message: 'Xác nhận mật khẩu không được để trống'
    })
    confirm_password: string;

}