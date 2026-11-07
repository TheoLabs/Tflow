import { Module } from '@nestjs/common';
import { AdminMemberController } from './presentation/admin-member.controller';
import { AdminMemberService } from './application/admin-member.service';

@Module({
  imports: [],
  controllers: [AdminMemberController],
  providers: [AdminMemberService],
  exports: [AdminMemberService],
})
export class MemberModule {}
