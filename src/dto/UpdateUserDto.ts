import { IsString, IsNotEmpty, MinLength, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Некорректный email' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @IsOptional()
  firstName?: string;

  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsOptional()
  lastName?: string;

  @IsString({ message: 'Роль должна быть строкой' })
  @IsOptional()
  role?: string;

  @IsBoolean({ message: 'isActive должно быть булевым значением' })
  @IsOptional()
  isActive?: boolean;
}
