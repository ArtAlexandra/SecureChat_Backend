import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schemas';
import mongoose from 'mongoose';
import { CreateUser } from './dto/create-user.dto';
import { THEME } from './Theme';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    private jwtService: JwtService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find();
    return users;
  }

  findOne(filter: {
    where: {
      id?: number | string;
      name?: string;
      password?: string;
      nik?: string;
    };
  }): Promise<User> {
    return this.userModel.findOne({ ...filter });
  }

  async createUser(data: CreateUser): Promise<User | Error> {
    const userValidateToName = await this.userModel
      .findOne({ name: data.name })
      .exec();
    if (userValidateToName) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }
    const userValidateToNik = await this.userModel
      .findOne({ nik: data.nik })
      .exec();
    if (userValidateToNik) {
      throw new ConflictException('Пользователь с таким ником уже существует');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel();
    user.name = data.name;
    user.nik = data.nik;
    user.password = hashedPassword;
    user.theme = THEME.LIGHT;
    return user.save();
  }

  async deleteUserById(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Такой пользователь не найден');
    }
  }

  async updateUserName(id: string, name: string): Promise<User | Error> {
    const userValidateToName = await this.userModel.findOne({ name }).exec();
    if (userValidateToName) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { name }, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Пользователь не найден');
    }
    return updatedUser;
  }

  async updateUserNik(id: string, nik: string): Promise<User | Error> {
    const userValidateToName = await this.userModel.findOne({ nik }).exec();
    if (userValidateToName) {
      throw new ConflictException(
        'Пользователь с таким никнеймом уже существует',
      );
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { nik }, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Пользователь не найден');
    }
    return updatedUser;
  }

  async updateUserPassword(
    id: string,
    password: string,
  ): Promise<User | Error> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Пользователь не найден');
    }
    return updatedUser;
  }

  async selectUserByNik(nik: string): Promise<User | Error> {
    const userValidateToNik = await this.userModel
      .findOne({ nik })
      .select('-password')
      .exec();
    if (!userValidateToNik) {
      throw new ConflictException('Пользователь с таким никнеймом не найден');
    }
    return userValidateToNik;
  }

  async selectUserById(id: string): Promise<User | Error> {
    const userValidateToId = await this.userModel
      .findOne({ _id: id })
      .select('-password')
      .exec();
    if (!userValidateToId) {
      throw new ConflictException('Пользователь с таким id не найден');
    }
    return userValidateToId;
  }

  async findUsersWithSimilarNik(nik: string): Promise<User[]> {
    const regex = new RegExp(nik, 'i');
    const users = await this.userModel
      .find({ name: { $regex: regex } })
      .select('name nik')
      .limit(10)
      .exec();

    return users;
  }

  async login(
    nik: string,
    password: string,
  ): Promise<{ access_token: string; id: number }> {
    const userValidateToNik = await this.userModel.findOne({ nik }).exec();
    if (!userValidateToNik) {
      throw new ConflictException('Пользователь с таким никнеймом не найден');
    }
    const passwordValid = await bcrypt.compare(
      password,
      userValidateToNik.password,
    );
    if (!passwordValid) {
      throw new ConflictException('Пользователь с таким паролем не найден');
    }
    const payload = { sub: userValidateToNik.id, nik: nik };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token: access_token,
      id: userValidateToNik?.id,
    };
  }
}
