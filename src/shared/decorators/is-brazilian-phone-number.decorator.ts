import { registerDecorator, ValidationOptions } from 'class-validator';

const dddsBrasil = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
];

export function IsBrazilianPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsBrazilianPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          const numeros = value.replace(/\D/g, '');
          const ddd = numeros.substring(0, 2);

          return (
            numeros.length === 11 &&
            numeros[2] === '9' &&
            dddsBrasil.includes(Number(ddd))
          );
        },
        defaultMessage() {
          return `Phone number must have template of (XX) 9XXXX-XXXX or XX9XXXXXXXX and with a valid DDD`;
        },
      },
    });
  };
}
