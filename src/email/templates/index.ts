import { EmailTemplateEnum } from '@src/email/enums/email-templates.enum';
import { EmailValidationTemplate } from '@src/email/templates/email-validation.template';
import { EmailForgetPasswordTemplate } from '@src/email/templates/forget-password.template';

export default {
  [EmailTemplateEnum.CONFIRMATION]: EmailValidationTemplate,
  [EmailTemplateEnum.FORGET_PASSWORD]: EmailForgetPasswordTemplate,
};
