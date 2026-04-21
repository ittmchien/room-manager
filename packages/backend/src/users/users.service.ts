import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async upsertFromSupabase(_supabaseUser: { id: string; email?: string; phone?: string }): Promise<unknown> {
    throw new Error('Not implemented');
  }
}
