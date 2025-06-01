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
import { MailService } from '../email/email.service';

@Injectable()
export class UserService {
  private codesStorage = new Map<string, { code: string; expiresAt: Date }>();

  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    private jwtService: JwtService,
    private mailServive: MailService,
  ) { }

  generateCode(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    this.codesStorage.set(email, { code, expiresAt });
    return code;
  }

  verifyCode(email: string, userCode: string): boolean {
    const record = this.codesStorage.get(email);
    if (typeof record === 'undefined') return false;
    const { code, expiresAt } = record;
    return code === userCode && new Date() < expiresAt;
  }

  removeCode(email: string): void {
    this.codesStorage.delete(email);
  }

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

  async sendCodeByMailSignUp(data: CreateUser): Promise<string | Error> {
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
    if (data.password.length < 8) {
      throw new ConflictException(
        'Пароль должен состоять минимум из 8 символов',
      );
    }
    const code = this.generateCode(data.email);
    const title = 'Подтверждение почты';
    const text = `Для подтверждения почты введите код: ${code}`;
    this.mailServive.sendEmail(data.email, title, text);
    return 'Код подтверждения успешно отправлен на почту';
  }

  async createUser(data: CreateUser): Promise<User | Error> {
    const isValidate = await this.verifyCode(data.email, data.code);
    if (!isValidate) {
      throw new ConflictException('Неверный код подтверждения');
    }
    this.removeCode(data.email);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel();
    user.name = data.name;
    user.nik = data.nik;
    user.email = data.email;
    user.password = hashedPassword;
    user.theme = THEME.LIGHT;
    user.image = '/uploads/defaultLogo.jpg';
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

  async updateUserImage(id: string, fileUrl: string): Promise<User | Error> {
    const userValidateToName = await this.userModel.findById(id);
    console.log(userValidateToName)
    if (!userValidateToName) {
      throw new ConflictException(
        'Пользователь с таким id не существует',
      );
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { image: fileUrl }, { new: true })
      .select('-password')
      .exec();
    return updatedUser;
  }

  async updateUserPassword(
    id: string,
    password: string,
  ): Promise<User | Error> {
    if (password.length < 8) {
      throw new ConflictException(
        'Пароль должен состоять минимум из 8 символов',
      );
    }
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
  ): Promise<{ access_token: string; user: { id: string } }> {
    const user = await this.userModel.findOne({ nik }).exec();

    if (!user) {
      throw new ConflictException('Пользователь с таким никнеймом не найден');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new ConflictException('Неверный пароль');
    }
    const payload = {
      sub: user._id.toString(),
      nik: user.nik,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
      user: {
        id: user._id.toString(),
      },
    };
  }
}
