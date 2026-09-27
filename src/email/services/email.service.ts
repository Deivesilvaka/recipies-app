import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { SendEmailDto } from '@src/email/dto/send-mail.dto';
import templates from '@src/email/templates/index';
import { EmailTemplateEnum } from '@src/email/enums/email-templates.enum';

@Injectable()
export class EmailService {
  private readonly mailTransport: Transporter;
  constructor(private configService: ConfigService) {
    this.mailTransport = createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: Number(this.configService.get('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(data: SendEmailDto): Promise<{ success: boolean } | null> {
    const { sender, recipients } = data;

    const mailOptions: SendMailOptions = {
      ...data,
      from: sender ?? {
        name: this.configService.get('MAIL_SENDER_NAME_DEFAULT'),
        address: this.configService.get('MAIL_SENDER_DEFAULT'),
      },
      to: recipients,
    };

    try {
      await this.mailTransport.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendTemplate(template: EmailTemplateEnum, data: any) {
    const fullTemplate = templates[template](data);
    await this.sendEmail(fullTemplate as SendEmailDto);
  }
}
