import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { hasPlanFeature } from '@/lib/billing/plans';
import { generateWorkspaceSlug, isValidWorkspaceSlug } from '@/lib/workspaces/roles';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Fetch user memberships and orgs
    const { data: memberships, error } = await admin
      .from('memberships')
      .select('role, joined_at, organization_id, organizations(*)')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const workspaces = (memberships || []).map((m) => ({
      role: m.role,
      joinedAt: m.joined_at,
      organization: m.organizations,
    }));

    return NextResponse.json({ workspaces });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Check caller's subscription tier
    const { data: profile } = await admin
      .from('profiles')
      .select('id, plan, subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single();

    const allowed = hasPlanFeature(profile, 'workspaces');
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Team workspaces are an exclusive feature of the Scholar plan (up to 10 members).',
          code: 'UPGRADE_REQUIRED',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name || name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Workspace name must be between 2 and 50 characters.' },
        { status: 400 }
      );
    }

    let slug = typeof body.slug === 'string' ? generateWorkspaceSlug(body.slug) : generateWorkspaceSlug(name);
    if (!isValidWorkspaceSlug(slug)) {
      slug = `${generateWorkspaceSlug(name)}-${Date.now().toString(36).slice(-4)}`;
    }

    // Check slug collision
    const { data: existing } = await admin
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Create organization
    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name,
        slug,
        owner_id: user.id,
        is_premium: true,
      })
      .select('*')
      .single();

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // Add creator as ADMIN in memberships
    await admin.from('memberships').insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'ADMIN',
    });

    // Record initial workspace activity
    await admin.from('organization_activities').insert({
      organization_id: org.id,
      user_id: user.id,
      action: 'joined_workspace',
      target_title: `${name} Workspace created`,
      target_id: org.id,
    });

    return NextResponse.json({
      success: true,
      workspace: org,
      role: 'ADMIN',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
