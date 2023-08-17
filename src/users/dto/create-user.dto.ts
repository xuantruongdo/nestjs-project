import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator";
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

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
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
}