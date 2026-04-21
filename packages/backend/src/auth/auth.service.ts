import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow('SUPABASE_URL'),
      this.configService.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async verifyToken(token: string): Promise<SupabaseUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) return null;

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
      };
    } catch {
      return null;
    }
  }
}
