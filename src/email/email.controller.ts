import { Controller, Get, Param } from '@nestjs/common';
import { MailService } from './email.service';

@Controller('email')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('/send/:email')
  getEmail(@Param('email') email: string): void {
    return this.mailService.sendEmail(email);
  }
}
