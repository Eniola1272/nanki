export type WorkspaceRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export const MAX_WORKSPACE_MEMBERS = 10;

export const WORKSPACE_ROLES: {
  role: WorkspaceRole;
  title: string;
  badgeClass: string;
  description: string;
}[] = [
  {
    role: 'ADMIN',
    title: 'Workspace Admin',
    badgeClass: 'bg-primary/10 text-primary border-primary/30',
    description: 'Full workspace access: manage settings, invite or remove team members, and create or edit shared study decks.',
  },
  {
    role: 'MEMBER',
    title: 'Team Member',
    badgeClass: 'bg-secondary/10 text-secondary border-secondary/30',
    description: 'Collaborative learner: can create, edit, and study shared quizzes and flashcards with the team.',
  },
  {
    role: 'VIEWER',
    title: 'Study Viewer',
    badgeClass: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
    description: 'Read-only access: can take shared team quizzes, study team decks, and track personal review progress.',
  },
];

export function canManageWorkspace(role: WorkspaceRole | null | undefined): boolean {
  return role === 'ADMIN';
}

export function canInviteMembers(role: WorkspaceRole | null | undefined): boolean {
  return role === 'ADMIN';
}

export function canCreateTeamContent(role: WorkspaceRole | null | undefined): boolean {
  return role === 'ADMIN' || role === 'MEMBER';
}

export function canDeleteTeamContent(role: WorkspaceRole | null | undefined, isAuthor: boolean): boolean {
  return role === 'ADMIN' || isAuthor;
}

export function canViewTeamContent(role: WorkspaceRole | null | undefined): boolean {
  return role === 'ADMIN' || role === 'MEMBER' || role === 'VIEWER';
}

export function generateWorkspaceSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'workspace';
}

export function isValidWorkspaceSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 48;
}
