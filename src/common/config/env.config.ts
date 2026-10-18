import { plainToInstance } from 'class-transformer';
import { IsInt, IsString, IsUrl, Min, validateSync } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class EnvConfig {
  @IsInt()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsUrl({ require_tld: false })
  CORS_ORIGIN: string;

  @IsUrl({ require_tld: false })
  APP_URL: string;

  @IsString()
  STRIPE_SECRET_KEY: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;

  @IsString()
  RESEND_API_KEY: string;

  @IsString()
  EMAIL_FROM: string;
}

export const validateEnv = (raw: Record<string, unknown>): EnvConfig => {
  const config = plainToInstance(EnvConfig, raw, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length > 0)
    throw new BadRequestException(
      `Invalid environment: ${errors.map((e) => e.property).join(', ')}`,
    );
  return config;
};
