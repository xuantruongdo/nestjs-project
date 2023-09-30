import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserByAdminDto, UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { RolesService } from 'src/roles/roles.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private rolesService: RolesService) { }

  @Post()
  @ResponseMessage("Create a new user")
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user)
  }

  @Public()
  @Get()
  @ResponseMessage("Fetch users with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage("Get count user")
  @Get('/count')
  count() {
    return this.usersService.getCount();
  }

  @Get(':id')
  @ResponseMessage("Get user by id")
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('change-password/:id')
  @ResponseMessage("Change password")
  async changePassword(@Param('id') id: string, @Body() changPasswordDto: ChangePasswordDto,  @User() user: IUser) {
    const role = await this.rolesService.findOne(user.role);
    if (id !== user._id && role.name !== "SUPER_ADMIN") {
      throw new NotFoundException('Tài khoản không tồn tại hoặc bạn không có quyền sửa tài khoản này.');
    }
    return this.usersService.changePassword(id, changPasswordDto, user);
  }

  @Patch(':id')
  @ResponseMessage("update user")
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    const role = await this.rolesService.findOne(user.role);
    if (id !== user._id && role.name !== "SUPER_ADMIN") {
      throw new NotFoundException('Tài khoản không tồn tại hoặc bạn không có quyền sửa tài khoản này.');
    }
    return this.usersService.update(id, updateUserDto, user);
  }

  @Patch('update-user-by-admin/:id')
  @ResponseMessage("Update user by admin")
  async updateByAdmin(@Param('id') id: string, @Body() updateUserByAdminDto: UpdateUserByAdminDto, @User() user: IUser) {
    const role = await this.rolesService.findOne(user.role);
    if (role.name !== "SUPER_ADMIN") {
      throw new NotFoundException('Tài khoản không tồn tại hoặc bạn không có quyền sửa tài khoản này.');
    }
    return this.usersService.updateByAdmin(id, updateUserByAdminDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete user")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

}
