import { DddException } from '@libs/ddd';
import { HttpStatus } from '@nestjs/common';

export class DepartmentNameDuplicatedException extends DddException {
  constructor(name: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'DEPARTMENT_NAME_DUPLICATED',
      clientMessage: '이미 존재하는 부서 이름입니다.',
      serverMessage: `Department name(${name}) is already exists.`,
    });
  }
}

export class DepartmentNotFoundException extends DddException {
  constructor(id: number) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: 'DEPARTMENT_NOT_FOUND',
      clientMessage: '존재하지 않는 부서입니다.',
      serverMessage: `Department with id(${id}) not found.`,
    });
  }
}
