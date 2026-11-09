import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@libs/utils';

abstract class BaseDepartmentQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  keyword?: string;
}

export class AdminDepartmentQueryDto extends BaseDepartmentQueryDto {}
