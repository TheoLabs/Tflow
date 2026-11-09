import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Member } from '../domain/member.entity';
import {
  applyLikeSearch,
  applyPagination,
  checkInValue,
  convertOptions,
  PaginationOptions,
  stripUndefined,
  TypeormRelationOptions,
} from '@libs/utils';
import { MemberStatus } from '../domain/member.entity';

@Injectable()
export class MemberRepository extends DddRepository<Member> {
  entityClass = Member;

  async find(
    conditions: {
      ids?: number[];
      name?: string;
      email?: string;
      employeeNumber?: string;
      statuses?: MemberStatus[];
    },
    options?: TypeormRelationOptions<Member>
  ) {
    return this.entityManager.find(this.entityClass, {
      where: stripUndefined({
        id: checkInValue(conditions.ids),
        name: conditions.name,
        email: conditions.email,
        employeeNumber: conditions.employeeNumber,
        status: checkInValue(conditions.statuses),
      }),
      ...convertOptions(options),
    });
  }

  async count(conditions: {
    ids?: number[];
    name?: string;
    email?: string;
    employeeNumber?: string;
    statuses?: MemberStatus[];
  }) {
    return this.entityManager.count(this.entityClass, {
      where: stripUndefined({
        id: checkInValue(conditions.ids),
        name: conditions.name,
        email: conditions.email,
        employeeNumber: conditions.employeeNumber,
        status: checkInValue(conditions.statuses),
      }),
    });
  }

  async findAndCount(conditions: { statuses?: MemberStatus[]; keyword?: string }, options?: PaginationOptions) {
    const qb = this.createQueryBuilder('member');

    if (conditions.statuses?.length) {
      qb.andWhere('member.status IN (:...statuses)', { statuses: conditions.statuses });
    }

    const likeSearch = applyLikeSearch(
      qb,
      { name: 'member.name', email: 'member.email', employeeNumber: 'member.employeeNumber' },
      ['name', 'email', 'employeeNumber'],
      conditions.keyword
    );

    return applyPagination(likeSearch, options).getManyAndCount();
  }

  /**
   * 부서별 직원 수를 집계한다. (SELECT departmentId, COUNT(*) ... GROUP BY departmentId)
   * - 미배정(departmentId IS NULL) 직원은 제외한다.
   * - 직원이 0명인 부서는 결과에 없다 → 호출부에서 `map.get(id) ?? 0`으로 읽는다.
   *
   * @param conditions.departmentIds 지정하면 해당 부서들만 집계. 빈 배열이면 빈 Map.
   * @param conditions.statuses 지정하면 해당 재직 상태만 집계 (예: 퇴사자 제외 시 [ACTIVE, ON_LEAVE]).
   * @returns Map<departmentId, 직원 수>
   */
  async countByDepartment(
    conditions: { departmentIds?: number[]; statuses?: MemberStatus[] } = {}
  ): Promise<Map<number, number>> {
    if (conditions.departmentIds && !conditions.departmentIds.length) {
      return new Map();
    }

    const qb = this.createQueryBuilder('member')
      .select('member.departmentId', 'departmentId')
      .addSelect('COUNT(member.id)', 'count')
      .where('member.departmentId IS NOT NULL')
      .groupBy('member.departmentId');

    if (conditions.departmentIds?.length) {
      qb.andWhere('member.departmentId IN (:...departmentIds)', { departmentIds: conditions.departmentIds });
    }

    if (conditions.statuses?.length) {
      qb.andWhere('member.status IN (:...statuses)', { statuses: conditions.statuses });
    }

    // NOTE: mysql 드라이버는 COUNT 결과를 문자열로 돌려줄 수 있으므로 Number로 정규화한다.
    const rows = await qb.getRawMany<{ departmentId: number | string; count: number | string }>();

    return new Map(rows.map((row) => [Number(row.departmentId), Number(row.count)]));
  }
}
