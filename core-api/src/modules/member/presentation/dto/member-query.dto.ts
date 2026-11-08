import { PaginationDto } from '@libs/utils';
import { IsOptional, IsString } from 'class-validator';

class BaseMemberQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  email?: string;
}

export class AdminMemberQueryDto extends BaseMemberQueryDto {}
