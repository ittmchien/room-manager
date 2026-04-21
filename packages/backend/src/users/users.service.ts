import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '@room-manager/shared';
import { SupabaseUser } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertFromSupabase(supabaseUser: SupabaseUser): Promise<AuthUser> {
    const email = supabaseUser.email || null;
    const phone = supabaseUser.phone || null;
    const name = email?.split('@')[0] || phone || 'User';

    const user = await this.prisma.user.upsert({
      where: { supabaseUserId: supabaseUser.id },
      create: {
        supabaseUserId: supabaseUser.id,
        email,
        phone,
        name,
      },
      update: {
        email,
        phone,
      },
    });

    return {
      id: user.id,
      supabaseUserId: user.supabaseUserId,
      email: user.email,
      phone: user.phone,
      name: user.name,
    };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(id: string, data: { name?: string; avatar?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
