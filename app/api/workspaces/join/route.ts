import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to accept this workspace invite.' }, { status: 401 });
    }

    const body = await req.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'Invitation token is missing.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify token
    const { data: invite, error: inviteError } = await admin
      .from('organization_invites')
      .select('*, organizations(id, name, slug)')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation link.' }, { status: 404 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'This invitation has already been used or revoked.' }, { status: 400 });
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This invitation has expired. Request a new invite from the admin.' }, { status: 400 });
    }

    // Add membership
    const { error: memberError } = await admin
      .from('memberships')
      .upsert(
        {
          organization_id: invite.organization_id,
          user_id: user.id,
          role: invite.role,
        },
        { onConflict: 'user_id,organization_id' }
      );

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Mark invite accepted
    await admin
      .from('organization_invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    // Record activity
    const org = invite.organizations as unknown as { id: string; name: string; slug: string };
    await admin.from('organization_activities').insert({
      organization_id: invite.organization_id,
      user_id: user.id,
      action: 'joined_workspace',
      target_title: `Joined as ${invite.role}`,
      target_id: user.id,
    });

    return NextResponse.json({
      success: true,
      workspace: org,
      role: invite.role,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
