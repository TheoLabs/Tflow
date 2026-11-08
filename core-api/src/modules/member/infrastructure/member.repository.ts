import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Member } from '../domain/member.entity';
import { checkLikeValue, convertOptions, stripUndefined, TypeormRelationOptions } from '@libs/utils';

@Injectable()
export class MemberRepository extends DddRepository<Member> {
  entityClass = Member;

  async find(
    conditions: {
      id?: number;
      name?: string;
      email?: string;
      employeeNumber?: string;
      searchKey?: string;
      searchValue?: string;
    },
    options?: TypeormRelationOptions<Member>
  ) {
    return this.entityManager.find(this.entityClass, {
      where: stripUndefined({
        id: conditions.id,
        name: conditions.name,
        email: conditions.email,
        employeeNumber: conditions.employeeNumber,
        ...checkLikeValue({ searchKey: conditions.searchKey, searchValue: conditions.searchValue }),
      }),
      ...convertOptions(options),
    });
  }

  async count(conditions: {
    id?: number;
    name?: string;
    email?: string;
    employeeNumber?: string;
    searchKey?: string;
    searchValue?: string;
  }) {
    return this.entityManager.count(this.entityClass, {
      where: stripUndefined({
        id: conditions.id,
        name: conditions.name,
        email: conditions.email,
        employeeNumber: conditions.employeeNumber,
        ...checkLikeValue({ searchKey: conditions.searchKey, searchValue: conditions.searchValue }),
      }),
    });
  }
}
