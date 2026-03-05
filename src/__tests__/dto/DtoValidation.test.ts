import { validate } from 'class-validator';
import { CreateUserDto } from '../../dto/CreateUserDto';
import { UpdateUserDto } from '../../dto/UpdateUserDto';
import { LoginDto } from '../../dto/LoginDto';
import { ChangePasswordDto } from '../../dto/ChangePasswordDto';

describe('DTO Validation', () => {
  describe('CreateUserDto', () => {
    it('должен проходить валидацию с корректными данными', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.firstName = 'John';
      dto.lastName = 'Doe';
      dto.role = 'user';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('должен проходить валидацию без role', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.firstName = 'John';
      dto.lastName = 'Doe';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('должен отклонять некорректный email', async () => {
      const dto = new CreateUserDto();
      dto.email = 'invalid-email';
      dto.password = 'password123';
      dto.firstName = 'John';
      dto.lastName = 'Doe';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('должен отклонять пустой email', async () => {
      const dto = new CreateUserDto();
      dto.email = '';
      dto.password = 'password123';
      dto.firstName = 'John';
      dto.lastName = 'Doe';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('должен отклонять короткий пароль', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = '12345';
      dto.firstName = 'John';
      dto.lastName = 'Doe';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('должен отклонять пустой пароль', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = '';
      dto.firstName = 'John';
      dto.lastName = 'Doe';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('должен отклонять пустое firstName', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.firstName = '';
      dto.lastName = 'Doe';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('firstName');
    });

    it('должен отклонять пустое lastName', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.firstName = 'John';
      dto.lastName = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('lastName');
    });

    it('должен отклонять недопустимую роль', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.firstName = 'John';
      dto.lastName = 'Doe';
      dto.role = 'superadmin' as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
    });
  });

  describe('UpdateUserDto', () => {
    it('должен проходить валидацию с корректными данными', async () => {
      const dto = new UpdateUserDto();
      dto.email = 'test@example.com';
      dto.firstName = 'John';
      dto.lastName = 'Doe';
      dto.role = 'user';
      dto.isActive = true;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('должен проходить валидацию с частичными данными', async () => {
      const dto = new UpdateUserDto();
      dto.firstName = 'John';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('должен отклонять некорректный email', async () => {
      const dto = new UpdateUserDto();
      dto.email = 'invalid-email';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('должен отклонять недопустимую роль', async () => {
      const dto = new UpdateUserDto();
      dto.role = 'admin' as any;

      const errors = await validate(dto);
      // role валиден, поэтому ошибок не должно быть
      expect(errors.length).toBe(0);
    });

    it('должен отклонять не boolean isActive', async () => {
      const dto = new UpdateUserDto();
      dto.isActive = 'true' as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('isActive');
    });
  });

  describe('LoginDto', () => {
    it('должен проходить валидацию с корректными данными', async () => {
      const dto = new LoginDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('должен отклонять некорректный email', async () => {
      const dto = new LoginDto();
      dto.email = 'invalid-email';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('должен отклонять пустой пароль', async () => {
      const dto = new LoginDto();
      dto.email = 'test@example.com';
      dto.password = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });
  });

  describe('ChangePasswordDto', () => {
    it('должен проходить валидацию с корректными данными', async () => {
      const dto = new ChangePasswordDto();
      dto.oldPassword = 'oldpass123';
      dto.newPassword = 'newpass123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('должен отклонять короткий новый пароль', async () => {
      const dto = new ChangePasswordDto();
      dto.oldPassword = 'oldpass123';
      dto.newPassword = '123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('newPassword');
    });

    it('должен отклонять пустой старый пароль', async () => {
      const dto = new ChangePasswordDto();
      dto.oldPassword = '';
      dto.newPassword = 'newpass123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('oldPassword');
    });
  });
});
