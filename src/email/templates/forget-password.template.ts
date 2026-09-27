import { ConfigModule } from '@nestjs/config';
import { APP_NAME } from '@src/email/constants/app-name';

ConfigModule.forRoot();

export function EmailForgetPasswordTemplate(data: any) {
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <p>Olá,</p>
    <p>
      Este email é para redefinição de senha. Você pode redefinir sua senha a
      partir do link abaixo:
      <br /><a
        href="${process.env.CURRENT_URL}?id=${data.id}"
        style="font-size: 24px; font-weight: 700"
        >Redefinir senha</a
      >
    </p>
    <p>Obrigado,<br />${APP_NAME}</p>
  </body>
</html>
`;

  return {
    subject: `${APP_NAME}: Redefinição de senha`,
    recipients: [{ name: data.user.name, address: data.user.email }],
    html,
  };
}
