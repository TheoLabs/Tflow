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
      id?: number;
      name?: string;
      email?: string;
      employeeNumber?: string;
      statuses?: MemberStatus[];
    },
    options?: TypeormRelationOptions<Member>
  ) {
    return this.entityManager.find(this.entityClass, {
      where: stripUndefined({
        id: conditions.id,
        name: conditions.name,
        email: conditions.email,
        employeeNumber: conditions.employeeNumber,
        status: checkInValue(conditions.statuses),
      }),
      ...convertOptions(options),
    });
  }

  async count(conditions: {
    id?: number;
    name?: string;
    email?: string;
    employeeNumber?: string;
    statuses?: MemberStatus[];
  }) {
    return this.entityManager.count(this.entityClass, {
      where: stripUndefined({
        id: conditions.id,
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
}
