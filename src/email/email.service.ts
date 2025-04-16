import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  sendEmail(email: string, title?: string, text?: string): void {
    this.mailService.sendMail({
      to: email,
      from: 'sasaartushkova@gmail.com',
      subject: title || 'Заголовок',
      text: text || 'Дефотный текст',
    });
  }
}
