import { HttpStatus } from '@nestjs/common';

type DddExceptionProps = {
  statusCode: HttpStatus;
  errorCode: string;
  clientMessage: string;
  serverMessage: string;
};

/**
 * 도메인 예외의 기반 클래스.
 * - statusCode    : 응답 HTTP 상태 코드
 * - errorCode     : 프론트가 분기에 쓰는 고정 코드 (`도메인_상황` 대문자 스네이크, 예: MEMBER_EMAIL_DUPLICATED).
 *                   API 계약이므로 한 번 공개하면 바꾸지 않는다. 문구(clientMessage)는 자유롭게 바꿔도 된다.
 * - clientMessage : 프론트에 항상 그대로 반환되는 메시지
 * - serverMessage : 서버 로그에만 찍히는 메시지 (내부 식별자·원인 등 노출하면 안 되는 정보 포함 가능)
 *
 * ExceptionFilter(@libs/filters)가 DddException을 별도로 처리한다.
 *
 * @example
 * export class MemberAlreadyExistsException extends DddException {
 *   constructor(email: string) {
 *     super({
 *       statusCode: HttpStatus.CONFLICT,
 *       errorCode: 'MEMBER_EMAIL_DUPLICATED',
 *       clientMessage: '이미 등록된 이메일입니다.',
 *       serverMessage: `Member with email ${email} already exists`,
 *     });
 *   }
 * }
 */
export abstract class DddException extends Error {
  readonly statusCode: HttpStatus;
  readonly errorCode: string;
  readonly clientMessage: string;
  readonly serverMessage: string;

  constructor(props: DddExceptionProps) {
    // NOTE: Error.message = serverMessage → stack 첫 줄에도 서버 메시지가 찍힌다.
    super(props.serverMessage);
    // NOTE: 로그·스택에 'Error' 대신 실제 예외 클래스명이 찍히도록.
    this.name = new.target.name;

    this.statusCode = props.statusCode;
    this.errorCode = props.errorCode;
    this.clientMessage = props.clientMessage;
    this.serverMessage = props.serverMessage;
  }
}
