import { HttpStatus } from '@nestjs/common';
import { DddException } from '@libs/ddd';

export class MemberEmailDuplicatedException extends DddException {
  constructor(email: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'MEMBER_EMAIL_DUPLICATED',
      clientMessage: '이미 등록된 이메일입니다.',
      serverMessage: `Member's email(${email}) already exists.`,
    });
  }
}

export class MemberEmployeeNumberDuplicatedException extends DddException {
  constructor(employeeNumber: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'MEMBER_EMPLOYEE_NUMBER_DUPLICATED',
      clientMessage: '이미 등록된 사원번호입니다.',
      serverMessage: `Member's employee number(${employeeNumber}) already exists.`,
    });
  }
}
