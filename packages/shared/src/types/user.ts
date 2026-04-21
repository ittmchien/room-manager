export interface UserProfile {
  id: string;
  supabaseUserId: string;
  email: string | null;
  phone: string | null;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  supabaseUserId: string;
  email: string | null;
  phone: string | null;
  name: string;
}
