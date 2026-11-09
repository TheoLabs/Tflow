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
import { PaginationOptions, pickPagination } from '@libs/utils';
import { DepartmentResponseDto } from '../presentation/dto/department-response.dto';

@Injectable()
export class AdminDepartmentService extends DddService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly memberRepository: MemberRepository
  ) {
    super();
  }

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
      const [leaderMember] = await this.memberRepository.find({
        ids: [leaderMemberId],
        statuses: [MemberStatus.ACTIVE],
      });

      if (!leaderMember) {
        throw new MemberNotFoundException(leaderMemberId);
      }
    }

    const department = Department.of({ name, parentDepartmentId, leaderMemberId });

    await this.departmentRepository.save([department]);
  }

  async list({ keyword }: { keyword?: string }, options?: PaginationOptions) {
    const [departments, total] = await this.departmentRepository.findAndCount({ keyword }, options);

    return {
      departments: departments.map((department) => department.toInstance(DepartmentResponseDto)),
      total,
      ...pickPagination(options),
    };
  }

  /**
   * 부서 트리 API
   */
  async listTree() {
    const departments = await this.departmentRepository.find({});

    const memberCounts = await this.memberRepository.countByDepartment({
      departmentIds: departments.map((department) => department.id),
    });

    return departments.map((department) => ({
      ...department.toInstance(DepartmentResponseDto),
      memberCount: memberCounts.get(department.id) ?? 0,
    }));
  }
}
