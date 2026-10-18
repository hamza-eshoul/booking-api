import { createHash, randomBytes } from 'node:crypto';

export class ManageTokenUtils {
  static generate(): string {
    return randomBytes(32).toString('base64url');
  }

  static hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
