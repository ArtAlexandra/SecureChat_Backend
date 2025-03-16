import {
  Body,
  HttpStatus,
  HttpException,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUser } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/get-all')
  async getAll() {
    try {
      return await this.userService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Post('/auth')
  async auth(@Body() data: CreateUser) {
    try {
      return await this.userService.createUser(data);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Delete('/delete/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.userService.deleteUserById(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Patch('/update-name/:id')
  async updateName(@Param('id') id: string, @Body('name') name: string) {
    try {
      return await this.userService.updateUserName(id, name);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Patch('/update-nik/:id')
  async updateNik(@Param('id') id: string, @Body('nik') nik: string) {
    try {
      return await this.userService.updateUserNik(id, nik);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Patch('/update-password/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    try {
      return await this.userService.updateUserPassword(id, password);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Get('/select-nik/:nik')
  async selectUser(@Param('nik') nik: string) {
    try {
      return await this.userService.selectUserByNik(nik);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Get('/select-id/:id')
  async selectUserId(@Param('id') id: string) {
    try {
      return await this.userService.selectUserById(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Get('/find/:nik')
  async findUsersWithSimilarNik(@Param('nik') nik: string) {
    try {
      return await this.userService.findUsersWithSimilarNik(nik);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }
}
