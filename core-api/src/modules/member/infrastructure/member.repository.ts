import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Member } from '../domain/member.entity';

@Injectable()
export class MemberRepository extends DddRepository<Member> {
  entityClass = Member;

  async find() {}

  async count() {}
}
