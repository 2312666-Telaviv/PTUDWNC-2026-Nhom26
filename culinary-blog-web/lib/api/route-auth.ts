import { auth } from '@/lib/auth';

export interface SessionActor {
  id: string;
  name: string;
  roles: string[];
}

export async function getSessionActor(): Promise<SessionActor | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name || session.user.email || 'Người dùng',
    roles: Array.isArray(session.user.roles) ? session.user.roles : [],
  };
}

export function canManageRecipe(
  actor: SessionActor,
  recipe: { authorId: string }
): boolean {
  return actor.roles.includes('Admin') || actor.id === recipe.authorId;
}
