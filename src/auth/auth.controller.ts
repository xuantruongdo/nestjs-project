import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request as RequestType, Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Public()
    @ResponseMessage("User Login")
    @UseGuards(LocalAuthGuard)
    @Post("/login")
    handleLogin(@Request() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @Post("/register")
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    @Get('/account')
    async handleGetAccount(@User() user: IUser) {
      return user;
  }
  
  @Public()
  @Get('/refresh')
  async handleRefreshToken(@Req() request: RequestType, @Res({ passthrough: true }) response: Response) {

    const refresh_token = request.cookies["refresh_token"]
    return this.authService.processNewToken(refresh_token, response);
  }

  @Post('/logout')
  handleLogout(@Res({ passthrough: true }) response: Response, @User() user: IUser) {
    return this.authService.logout(response, user);
  }
}
