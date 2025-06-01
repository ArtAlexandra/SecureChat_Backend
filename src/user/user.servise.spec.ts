import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { User } from './schemas/user.schemas';
import { MailService } from '../email/email.service';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let jwtService: JwtService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashedPassword');
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

//   describe('login', () => {
//     it('should throw error for invalid nik', async () => {
//       jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
//       await expect(service.login('invalid', 'pass')).rejects.toThrow(
//         new ConflictException('Пользователь с таким никнеймом не найден')
//       );
//     });
//   });

//   describe('sendCodeByMailSignUp', () => {
//     it('should reject duplicate name', async () => {
//       const mockUser = { name: 'existing' };
//       jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser);
      
//       await expect(service.sendCodeByMailSignUp({
//         name: 'existing',
//         nik: 'new',
//         email: 'test@test.com',
//         password: 'validPass123',
//         code: '123456'
//       })).rejects.toThrow(new ConflictException('Пользователь с таким именем уже существует'));
//     });
//   });

//   describe('createUser', () => {
//     it('should reject invalid code', async () => {
//       jest.spyOn(service, 'verifyCode').mockReturnValue(false);
      
//       await expect(service.createUser({
//         name: 'test',
//         nik: 'test',
//         email: 'sandra.art.2@mail.ru',
//         password: 'password',
//         code: 'wrong'
//       })).rejects.toThrow(new ConflictException('Неверный код подтверждения'));
//     });
//   });

//   describe('updateUserPassword', () => {
//     it('should validate password length', async () => {
//       await expect(service.updateUserPassword('id', 'short'))
//         .rejects.toThrow(new ConflictException('Пароль должен состоять минимум из 8 символов'));
//     });
//   });

//   describe('deleteUserById', () => {
//     it('should handle non-existent user', async () => {
//       jest.spyOn(userModel, 'findByIdAndDelete').mockResolvedValueOnce(null);
//       await expect(service.deleteUserById('invalid'))
//         .rejects.toThrow(new NotFoundException('Такой пользователь не найден'));
//     });
//   });

  describe('selectUserByNik', () => {
    it('should throw for non-existent nik', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
      await expect(service.selectUserByNik('tettte'))
        .rejects.toThrow(new ConflictException('Пользователь с таким никнеймом не найден'));
    });
  });

//   describe('findUsersWithSimilarNik', () => {
//     it('should search with regex', async () => {
//       const mockUsers = [{ name: 'test', nik: 'test' }];
//       jest.spyOn(userModel, 'find').mockReturnValueOnce({
//         select: jest.fn().mockReturnThis(),
//         limit: jest.fn().mockResolvedValueOnce(mockUsers)
//       } as any);

//       const result = await service.findUsersWithSimilarNik('tes');
//       expect(userModel.find).toHaveBeenCalledWith({ name: expect.any(RegExp) });
//       expect(result).toEqual(mockUsers);
//     });
//   });

//   describe('codeStorage', () => {
//     it('should manage codes correctly', () => {
//       const email = 'test@test.com';
//       const code = service.generateCode(email);
      
//       expect(service.verifyCode(email, code)).toBe(true);
//       service.removeCode(email);
//       expect(service.verifyCode(email, code)).toBe(false);
//     });
//   });
});