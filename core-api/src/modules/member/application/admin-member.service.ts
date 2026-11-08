import { DddService } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { MemberRepository } from '../infrastructure/member.repository';
import { PaginationOptions, pickPagination } from '@libs/utils';
import { AdminMemberResponseDto, MemberCreateDto } from '../presentation/dto';
import { Transactional } from '@libs/decorators';
import { MemberEmailDuplicatedException, MemberEmployeeNumberDuplicatedException } from '../domain/exception';
import { Member } from '../domain/member.entity';

@Injectable()
export class AdminMemberService extends DddService {
  constructor(private readonly memberRepository: MemberRepository) {
    super();
  }

  // FIXME: departmentId, roleId 검증도 필요한데 일단은 해당 도메인이 안만들어져서 생략
  @Transactional()
  async create({ name, email, employeeNumber, departmentId, roleId }: MemberCreateDto) {
    const [existingEmail] = await this.memberRepository.find({ email });

    if (existingEmail) {
      throw new MemberEmailDuplicatedException(email);
    }

    const [existingEmployeeNumber] = await this.memberRepository.find({ employeeNumber });

    if (existingEmployeeNumber) {
      throw new MemberEmployeeNumberDuplicatedException(employeeNumber);
    }

    const member = Member.of({ name, email, employeeNumber, departmentId, roleId });

    await this.memberRepository.save([member]);
  }

  async list({ email }: { email?: string }, options?: PaginationOptions) {
    const [members, total] = await Promise.all([
      this.memberRepository.find({ email }, { options }),
      this.memberRepository.count({ email }),
    ]);

    return {
      members: members.map((member) => member.toInstance(AdminMemberResponseDto)),
      total,
      ...pickPagination(options),
    };
  }
}
