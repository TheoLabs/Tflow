import { DddService } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { MemberRepository } from '../infrastructure/member.repository';

@Injectable()
export class AdminMemberService extends DddService {
  constructor(private readonly memberRepository: MemberRepository) {
    super();
  }
}
