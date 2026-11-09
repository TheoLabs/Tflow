import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DepartmentCreateDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  parentDepartmentId?: number | null;

  @IsNumber()
  @IsOptional()
  leaderMemberId?: number | null;
}
