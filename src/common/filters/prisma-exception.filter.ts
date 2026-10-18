import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    const exception =
      EXCEPTION_BY_PRISMA_CODE[error.code]?.() ??
      new InternalServerErrorException();
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}
