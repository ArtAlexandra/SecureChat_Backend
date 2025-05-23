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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUser } from './dto/create-user.dto';
import { AuthGuard } from './auth.guard';
import { User } from './schemas/user.schemas';
import { UserDecorator } from 'src/decorators/user.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      console.log(file)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
};
@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

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
  @Patch('/update-password')
  async updatePassword(
    @UserDecorator() user: User,
    @Body('password') password: string,
  ) {
    try {
      const userId = user.id;
      return await this.userService.updateUserPassword(userId, password);
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
  @Patch('/update-image')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async updateImage(
    @UploadedFile() file: Express.Multer.File,
    @UserDecorator() user: User,
  ) {
    try {
      const fileUrl = file ? `/uploads/${file.filename}` : undefined;
      const userId = user.id;
      return await this.userService.updateUserImage(userId, fileUrl);
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
  @Get('/me')
  async getMe(@UserDecorator() user: User) {
    try {
      const userId = user.id;
      return await this.userService.selectUserById(userId);
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
