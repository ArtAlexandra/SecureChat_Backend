import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/user/schemas/user.schemas';

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user?.sub ? request.user.sub : request.user;
    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }
    return user as User;
  },
);
