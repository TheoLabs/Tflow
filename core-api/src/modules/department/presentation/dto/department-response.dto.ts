import { ResponseDto } from '@libs/utils';
import { Expose } from 'class-transformer';

@Expose()
export class DepartmentResponseDto extends ResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  parentDepartmentId: number | null;

  @Expose()
  leaderMemberId: number | null;
}
