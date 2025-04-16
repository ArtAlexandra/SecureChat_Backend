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
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUser } from './dto/create-user.dto';
import { AuthGuard } from './auth.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
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

  @Post('/signin')
  async login(@Body('nik') nik: string, @Body('password') password: string) {
    try {
      return await this.userService.login(nik, password);
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

  @Post('/auth/create')
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

  @Post('/auth/send-code')
  async sendCodeByMailSignUp(@Body() data: CreateUser) {
    try {
      return await this.userService.sendCodeByMailSignUp(data);
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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
