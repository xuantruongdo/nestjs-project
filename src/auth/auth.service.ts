import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rolesService: RolesService,
    ) { }
    
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid) {

                const userRole = user.role as unknown as { _id: string, fullname: string };
                const temp = await this.rolesService.findOne(userRole._id)

                const objUser = {
                    ...user.toObject(),
                    permissions: temp.permissions ?? []
                }

                return objUser;
            }
        }

        return null;
    }

    async login(user: IUser, response: Response) {
        const { _id, email, fullname, age, gender, address, role, permissions } = user;
        const temp = await this.rolesService.findOne(role);
        const payload = {
            sub: "token login",
            iss: "from server",
            _id, email, role // Include _id and name in the role field
        };
    
        const refresh_token = this.createRefreshToken(payload);
    
        await this.usersService.updateUserToken(refresh_token, _id);
    
        // Set refreshToken as cookie
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))
        });
        
        return {
            access_token: this.jwtService.sign(payload),
            user: { _id, email, fullname, age, gender, address, role: { _id: temp._id, name: temp.name }, permissions } // Include _id and name in the role field of the user object
        };
    }

    async register(registerUserDto: RegisterUserDto) {
        let newUser = await this.usersService.register(registerUserDto);
        return {
            _id: newUser?._id,
            createdAt: newUser?.createdAt
        }
    }

    createRefreshToken = (payload: any) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000,
        });

        return refreshToken;
    }

    processNewToken = async (refresh_token: string, response: Response) => {
        try {

            let user = await this.usersService.findUserByToken(refresh_token);

            if (user) {
                //update refresh_token
                const { _id, email, fullname, age, gender, address, role } = user;
                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id, email, role
                }

                const refresh_token = this.createRefreshToken(payload);

                await this.usersService.updateUserToken(refresh_token, _id.toString());

                const userRole = user.role as unknown as { _id: string; name: string };
                const temp = await this.rolesService.findOne(userRole._id);

                response.clearCookie('refresh_token');
                //Set refreshToken as cookie
                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))
                })

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        fullname,
                        email,
                        age,
                        gender,
                        address,
                        role,
                        permissions: temp?.permissions ?? []
                    }
                };
            }
        }
        catch (err) {
            throw new BadRequestException('Refresh token không hợp lệ! Vui lòng login')
        }
    }

    logout = async (response: Response, user: IUser) => {
        await this.usersService.updateUserToken("", user._id);
        response.clearCookie("refresh_token");
        return "ok";
    }

    fetchCurrentAccount = async (user: IUser) => {
        const { _id, email, role, permissions } = user;
        let userByEmail = await this.usersService.findOneByEmail(email)
        .populate([
            { path: "role", select: { _id: 1, name: 1 } },
        ])
        .select('_id email fullname age gender address role');
    
        // Tạo một đối tượng mới chứa thông tin từ userByEmail và thêm permissions
        let userCurrent = {
            ...userByEmail.toObject(), // Chuyển userByEmail thành một đối tượng thường để có thể thêm trường permissions
            permissions: permissions,
        };
        
        return userCurrent;
    
    }
}
