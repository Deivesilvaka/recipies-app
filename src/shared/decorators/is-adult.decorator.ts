import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAdult(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (!value) return false;

          // Verifica o formato DD/MM/YYYY
          if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            return false;
          }

          const [day, month, year] = value.split('/').map(Number);
          const birthDate = new Date(year, month - 1, day);

          // Verifica se a data é válida
          if (
            birthDate.getFullYear() !== year ||
            birthDate.getMonth() !== month - 1 ||
            birthDate.getDate() !== day
          ) {
            return false;
          }

          // Calcula a idade
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          return age >= 18;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser uma data válida no formato DD/MM/YYYY e o usuário deve ter pelo menos 18 anos`;
        },
      },
    });
  };
}
