import {
  type ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  ExceptionFilter as NestExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Context, ContextKey } from '@libs/context';
import { ConfigsService } from '@configs';
import { getLogContext } from '@libs/logger';
import { DddException } from '@libs/ddd';

// description을 넘기지 않은 예외(ValidationPipe·기본 HttpException)의 getResponse().error 에는
// Nest가 채우는 표준 문구가 들어온다. 이건 클라용 description이 아니므로 걸러낸다.
const DEFAULT_HTTP_PHRASES = new Set([
  'Bad Request',
  'Unauthorized',
  'Forbidden',
  'Not Found',
  'Method Not Allowed',
  'Not Acceptable',
  'Request Timeout',
  'Conflict',
  'Gone',
  'Unprocessable Entity',
  'Too Many Requests',
  'Internal Server Error',
]);

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  private readonly logger = new Logger();

  constructor(private readonly context: Context) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { status, errorCode, serverMessage, clientMessage } = this.resolve(exception);

    const txId = this.context.get<string>(ContextKey.TXID);
    const stack = exception instanceof Error ? exception.stack : '';

    const logPayload = {
      message: `[${request.method}] ${request.url} - ${txId}${'\n' + stack}`,
      txId,
      stack,
      errorCode,
      error: serverMessage,
      ...getLogContext(request),
    };

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(logPayload);
    } else {
      this.logger.warn(logPayload);
    }

    response.status(status).json({
      data: {
        code: errorCode,
        message: clientMessage,
      },
    });
  }

  // NOTE: 예외 종류별로 상태 코드·서버 로그 메시지·클라 응답 메시지를 결정한다.
  private resolve(exception: unknown): {
    status: number;
    errorCode: string;
    serverMessage: unknown;
    clientMessage: unknown;
  } {
    // 도메인 예외: 클래스에 정의된 값을 그대로 사용. clientMessage는 상태 코드와 무관하게 항상 프론트로 반환.
    if (exception instanceof DddException) {
      return {
        status: exception.statusCode,
        errorCode: exception.errorCode,
        serverMessage: exception.serverMessage,
        clientMessage: exception.clientMessage,
      };
    }

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : 'Internal Server Error';

    return {
      status,
      errorCode: this.resolveErrorCode(status),
      // 서버용 = 예외 1번째 인자(getResponse().message). 알 수 없는 에러는 Error.message.
      serverMessage:
        exception instanceof HttpException || !(exception instanceof Error)
          ? this.resolveServerMessage(exceptionResponse)
          : exception.message,
      // 클라용 = description(getResponse().error)
      clientMessage: this.resolveClientMessage(status, exceptionResponse),
    };
  }

  // DddException이 아닌 예외의 공통 코드: HTTP 상태 이름(BAD_REQUEST, NOT_FOUND 등). 5xx는 내부 정보 노출 없이 하나로 묶는다.
  private resolveErrorCode(status: number): string {
    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) return 'INTERNAL_SERVER_ERROR';
    return HttpStatus[status] ?? 'UNKNOWN_ERROR';
  }

  // 서버 로그용 메시지: 예외 1번째 인자(message)를 노출.
  private resolveServerMessage(res: string | object): unknown {
    if (typeof res === 'string') return res;
    return (res as { message?: unknown }).message ?? res;
  }

  // 클라 응답용 메시지: description(getResponse().error)을 우선 노출.
  private resolveClientMessage(status: number, res: string | object): unknown {
    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      return '서버에 예기치 않은 오류가 발생했습니다.';
    }
    if (typeof res === 'string') return res;

    const body = res as { message?: unknown; error?: unknown };

    // description은 getResponse().error 에 담긴다. Nest 표준 문구는 description이 아니므로 제외.
    const description =
      typeof body.error === 'string' && !DEFAULT_HTTP_PHRASES.has(body.error) ? body.error : undefined;
    if (description) return description;

    // description이 없을 때 폴백: ValidationPipe 메시지(배열)는 그대로, 그 외엔 message.
    if (Array.isArray(body.message)) return body.message;
    return body.message ?? '요청을 처리할 수 없습니다.';
  }
}
