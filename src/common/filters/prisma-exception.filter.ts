import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import type { Response } from 'express';
import { Prisma } from '@/generated/prisma/client.js';

const EXCEPTION_BY_PRISMA_CODE: Record<string, () => HttpException> = {
  P2002: () => new ConflictException('This slot was just taken'),
  P2025: () => new NotFoundException('Record not found'),
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const known = EXCEPTION_BY_PRISMA_CODE[error.code]?.();
    if (!known) Sentry.captureException(error);
    const exception = known ?? new InternalServerErrorException();
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}
