import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Department } from '../domain/department.entity';
import {
  applyLikeSearch,
  convertOptions,
  PaginationOptions,
  stripUndefined,
  TypeormRelationOptions,
  applyPagination,
} from '@libs/utils';

@Injectable()
export class DepartmentRepository extends DddRepository<Department> {
  entityClass = Department;

  async find(conditions: { id?: number; name?: string }, options?: TypeormRelationOptions<Department>) {
    return this.entityManager.find(this.entityClass, {
      where: stripUndefined({
        id: conditions.id,
        name: conditions.name,
      }),
      ...convertOptions(options),
    });
  }

  async count(conditions: { id?: number; name?: string }) {
    return this.entityManager.count(this.entityClass, {
      where: stripUndefined({
        id: conditions.id,
        name: conditions.name,
      }),
    });
  }

  async findAndCount(conditions: { keyword?: string }, options?: PaginationOptions) {
    const qb = this.createQueryBuilder('department').orderBy('department.name', 'ASC');

    const likeSearch = applyLikeSearch(qb, { name: 'department.name' }, ['name'], conditions.keyword);

    return applyPagination(likeSearch, options).getManyAndCount();
  }
}
