import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: Partial<AuthService>;
  let usersService: Partial<UsersService>;

  beforeEach(() => {
    authService = {
      verifyToken: jest.fn(),
    };
    usersService = {
      upsertFromSupabase: jest.fn(),
    };
    guard = new AuthGuard(
      authService as AuthService,
      usersService as UsersService,
    );
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: { authorization: authHeader },
      user: undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should throw UnauthorizedException when no auth header', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    (authService.verifyToken as jest.Mock).mockResolvedValue(null);
    const context = createMockContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set request.user and return true for valid token', async () => {
    const supabaseUser = {
      id: 'sup-123',
      email: 'test@test.com',
    };
    const dbUser = {
      id: 'db-123',
      supabaseUserId: 'sup-123',
      email: 'test@test.com',
      phone: null,
      name: 'Test',
    };
    (authService.verifyToken as jest.Mock).mockResolvedValue(supabaseUser);
    (usersService.upsertFromSupabase as jest.Mock).mockResolvedValue(dbUser);

    const context = createMockContext('Bearer valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(dbUser);
  });
});
