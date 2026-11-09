import { DddService } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { DepartmentRepository } from '../infrastructure/department.repository';
import { Transactional } from '@libs/decorators';
import { DepartmentCreateDto } from '../presentation/dto';
import { DepartmentNameDuplicatedException, DepartmentNotFoundException } from '../domain/exception';
import { Department } from '../domain/department.entity';
import { MemberRepository } from '@modules/member/infrastructure/member.repository';
import { MemberNotFoundException } from '@modules/member/domain/exception';
import { MemberStatus } from '@modules/member/domain/member.entity';

@Injectable()
export class AdminDepartmentService extends DddService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly memberRepository: MemberRepository
  ) {
    super();
  }

  // TODO: 멤버 검증 로직 해야함.
  @Transactional()
  async create({ name, parentDepartmentId, leaderMemberId }: DepartmentCreateDto) {
    const [existingDepartment] = await this.departmentRepository.find({ name });

    if (existingDepartment) {
      throw new DepartmentNameDuplicatedException(name);
    }

    if (parentDepartmentId) {
      const [parentDepartment] = await this.departmentRepository.find({ id: parentDepartmentId });

      if (!parentDepartment) {
        throw new DepartmentNotFoundException(parentDepartmentId);
      }
    }

    if (leaderMemberId) {
      const [leaderMember] = await this.memberRepository.find({ id: leaderMemberId, statuses: [MemberStatus.ACTIVE] });

      if (!leaderMember) {
        throw new MemberNotFoundException(leaderMemberId);
      }
    }

    const department = Department.of({ name, parentDepartmentId, leaderMemberId });

    await this.departmentRepository.save([department]);
  }
}
