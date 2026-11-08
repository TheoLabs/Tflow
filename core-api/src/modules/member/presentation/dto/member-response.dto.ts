import { MemberStatus } from '@modules/member/domain/member.entity';
import { Expose } from 'class-transformer';

@Expose()
export class AdminMemberResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  employeeNumber: string;

  @Expose()
  status: MemberStatus;
}
