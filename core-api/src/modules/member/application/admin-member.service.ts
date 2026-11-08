import { DddService } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { MemberRepository } from '../infrastructure/member.repository';

@Injectable()
export class AdminMemberService extends DddService {
  constructor(private readonly memberRepository: MemberRepository) {
    super();
  }

  async list() {
    const [members, total] = await Promise.all([this.memberRepository.find({}), this.memberRepository.count({})]);

    return { members, total };
  }
}
