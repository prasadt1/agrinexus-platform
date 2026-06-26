import { NextRequest, NextResponse } from 'next/server';
import { findPersona } from '@/lib/auth/demo-personas';
import { buildSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const personaId = body.personaId as string | undefined;

  if (!personaId) {
    return NextResponse.json({ error: 'personaId required' }, { status: 400 });
  }

  const persona = findPersona(personaId);
  if (!persona) {
    return NextResponse.json({ error: 'Unknown persona' }, { status: 400 });
  }

  const session = buildSessionCookie({
    userId: `demo-${persona.id}`,
    tenantId: persona.tenantId,
    role: persona.role,
    email: persona.email,
    tenantName: persona.tenantName,
    isDemo: true,
  });

  const response = NextResponse.json({
    ok: true,
    tenantId: persona.tenantId,
    role: persona.role,
    redirect: '/dashboard',
  });

  response.cookies.set(session.name, session.value, session.options);
  return response;
}
