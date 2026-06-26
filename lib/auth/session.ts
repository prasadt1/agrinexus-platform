import { cookies } from 'next/headers';
import type { UserRole } from '@/lib/entities/types';

export const SESSION_COOKIE = 'agrinexus_session';

export interface SessionPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
  tenantName: string;
  isDemo: boolean;
}

function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeSession(value: string): SessionPayload | null {
  try {
    const json = Buffer.from(value, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as SessionPayload;
    if (!parsed.tenantId || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export function buildSessionCookie(payload: SessionPayload): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    path: string;
    maxAge: number;
  };
} {
  return {
    name: SESSION_COOKIE,
    value: encodeSession(payload),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}
