import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { MAX_WORKSPACE_MEMBERS, type WorkspaceRole } from '@/lib/workspaces/roles';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Verify user is in workspace
    const { data: membership } = await admin
      .from('memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this workspace.' }, { status: 403 });
    }

    // Load members with profile details
    const { data: members, error: membersError } = await admin
      .from('memberships')
      .select('id, user_id, role, joined_at, profiles(id, name, avatar_url, email)')
      .eq('organization_id', orgId);

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    // Load pending invites if admin
    let invites: unknown[] = [];
    if (membership.role === 'ADMIN') {
      const { data: inviteRows } = await admin
        .from('organization_invites')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'pending');
      invites = inviteRows || [];
    }

    return NextResponse.json({
      members: members || [],
      invites,
      myRole: membership.role,
      maxMembers: MAX_WORKSPACE_MEMBERS,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Verify user is ADMIN
    const { data: membership } = await admin
      .from('memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only workspace admins can invite new members.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const role: WorkspaceRole = ['ADMIN', 'MEMBER', 'VIEWER'].includes(body.role)
      ? body.role
      : 'MEMBER';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    // Check member limits (max 10)
    const { count: memberCount } = await admin
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const { count: pendingCount } = await admin
      .from('organization_invites')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'pending');

    const totalSeats = (memberCount || 0) + (pendingCount || 0);
    if (totalSeats >= MAX_WORKSPACE_MEMBERS) {
      return NextResponse.json(
        { error: `Workspace member capacity limit of ${MAX_WORKSPACE_MEMBERS} members reached.` },
        { status: 400 }
      );
    }

    // Check if target user already belongs to org
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      const { data: existingMember } = await admin
        .from('memberships')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', existingProfile.id)
        .single();

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this workspace.' },
          { status: 400 }
        );
      }
    }

    const token = crypto.randomUUID();

    const { data: invite, error: inviteError } = await admin
      .from('organization_invites')
      .upsert(
        {
          organization_id: orgId,
          email,
          role,
          invited_by: user.id,
          token,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'organization_id,email' }
      )
      .select('*')
      .single();

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    // Record activity
    await admin.from('organization_activities').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'invited_member',
      target_title: `Invited ${email} as ${role}`,
    });

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${origin}/workspace/join?token=${token}`;

    return NextResponse.json({
      success: true,
      invite,
      inviteUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
