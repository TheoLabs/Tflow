import { Module } from '@nestjs/common';
import { AdminMemberController } from './presentation/admin-member.controller';
import { AdminMemberService } from './application/admin-member.service';
import { MemberRepository } from './infrastructure/member.repository';

@Module({
  imports: [],
  controllers: [AdminMemberController],
  providers: [AdminMemberService, MemberRepository],
  exports: [MemberRepository],
})
export class MemberModule {}
