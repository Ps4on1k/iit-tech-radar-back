import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Старый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Старый пароль обязателен' })
  @MinLength(6, { message: 'Старый пароль должен быть не менее 6 символов' })
  oldPassword!: string;

  @IsString({ message: 'Новый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Новый пароль обязателен' })
  @MinLength(6, { message: 'Новый пароль должен быть не менее 6 символов' })
  newPassword!: string;
}
