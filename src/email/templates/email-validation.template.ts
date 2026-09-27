import { APP_NAME } from '@src/email/constants/app-name';

export function EmailValidationTemplate(data: any) {
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <p>Olá ${data.user.userName},</p>
    <p>
      Para prosseguir, você precisa ativar sua conta com o seguinte código:
      <br /><span style="font-size: 24px; font-weight: 700">${data.otp}</span>
    </p>
    <p>Obrigado,<br />${APP_NAME}</p>
  </body>
</html>
`;

  return {
    subject: `${APP_NAME}: Verificação de email`,
    recipients: [{ name: data.user.name, address: data.user.email }],
    html,
  };
}
