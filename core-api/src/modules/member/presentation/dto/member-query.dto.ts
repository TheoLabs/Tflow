import { ToArray } from '@libs/decorators';
import { PaginationDto } from '@libs/utils';
import { MemberStatus } from '@modules/member/domain/member.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class BaseMemberQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @ToArray()
  @IsOptional()
  @IsEnum(MemberStatus, { each: true })
  statuses?: MemberStatus[];
}

export class AdminMemberQueryDto extends BaseMemberQueryDto {}
