import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class MemberCreateDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  employeeNumber: string;

  @IsNumber()
  @IsOptional()
  departmentId?: number | null;

  @IsNumber()
  @IsOptional()
  roleId?: number | null;
}
