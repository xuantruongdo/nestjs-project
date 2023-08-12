import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
    @IsNotEmpty()
    fullname: string;
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
}