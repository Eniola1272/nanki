import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { canManageWorkspace } from '@/lib/workspaces/roles';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // 1. Resolve organization by UUID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let orgQuery = admin.from('organizations').select('*');
    if (isUuid) {
      orgQuery = orgQuery.eq('id', id);
    } else {
      orgQuery = orgQuery.eq('slug', id);
    }

    const { data: org, error: orgError } = await orgQuery.single();
    if (orgError || !org) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // 2. Check user's membership
    const { data: userMembership } = await admin
      .from('memberships')
      .select('role, joined_at')
      .eq('organization_id', org.id)
      .eq('user_id', user.id)
      .single();

    if (!userMembership && org.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not a member of this workspace' },
        { status: 403 }
      );
    }

    const callerRole = userMembership?.role || 'ADMIN';

    // 3. Fetch all members with profile details
    const { data: rawMemberships } = await admin
      .from('memberships')
      .select('user_id, role, joined_at, profiles(id, name, email, avatar, streak, xp, accuracy)')
      .eq('organization_id', org.id);

    const members = (rawMemberships || []).map((m) => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return {
        userId: m.user_id,
        role: m.role,
        joinedAt: m.joined_at,
        name: p?.name || 'Team Member',
        email: p?.email || '',
        avatar: p?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        streak: p?.streak || 0,
        xp: p?.xp || 0,
        accuracy: p?.accuracy || 0,
      };
    });

    // 4. If admin, fetch pending invites
    let invites: Array<{
      id: string;
      email: string;
      role: string;
      token: string;
      createdAt: string;
      expiresAt: string;
    }> = [];

    if (canManageWorkspace(callerRole)) {
      const { data: rawInvites } = await admin
        .from('organization_invites')
        .select('*')
        .eq('organization_id', org.id)
        .eq('status', 'pending');

      invites = (rawInvites || []).map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        token: inv.token,
        createdAt: inv.created_at,
        expiresAt: inv.expires_at,
      }));
    }

    // 5. Fetch team quizzes
    const { data: quizzes } = await admin
      .from('quizzes')
      .select('id, title, description, category, mastered_percentage, published, created_at, user_id, profiles(name, avatar)')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false });

    // 6. Fetch team decks
    const { data: decks } = await admin
      .from('decks')
      .select('id, title, description, category, published, created_at, user_id, content, profiles(name, avatar)')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false });

    // 7. Fetch workspace activities
    const { data: rawActivities } = await admin
      .from('organization_activities')
      .select('id, action, target_title, target_id, metadata, created_at, profiles(name, avatar)')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const activities = (rawActivities || []).map((a) => {
      const p = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
      return {
        id: a.id,
        action: a.action,
        targetTitle: a.target_title,
        targetId: a.target_id,
        metadata: a.metadata,
        createdAt: a.created_at,
        userName: p?.name || 'Someone',
        userAvatar: p?.avatar || '',
      };
    });

    // 8. Aggregated Team Mastery Analytics
    const memberAccuracies = members.map((m) => m.accuracy).filter((a) => a > 0);
    const avgAccuracy = memberAccuracies.length > 0
      ? Math.round(memberAccuracies.reduce((sum, val) => sum + val, 0) / memberAccuracies.length)
      : 0;

    const totalTeamXp = members.reduce((sum, m) => sum + m.xp, 0);
    const totalQuestionsCount = (quizzes || []).length;
    const totalDecksCount = (decks || []).length;

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        ownerId: org.owner_id,
        createdAt: org.created_at,
      },
      userRole: callerRole,
      members,
      invites,
      quizzes: (quizzes || []).map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        masteredPercentage: q.mastered_percentage,
        published: q.published,
        createdAt: q.created_at,
        authorName: (q.profiles as unknown as { name?: string })?.name || 'Member',
        authorAvatar: (q.profiles as unknown as { avatar?: string })?.avatar || '',
      })),
      decks: (decks || []).map((d) => {
        const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
        return {
          id: d.id,
          title: d.title,
          description: d.description || '',
          category: d.category || 'General',
          author: (p as { name?: string })?.name || 'Member',
          cardCount: Array.isArray(d.content) ? d.content.length : 0,
          published: d.published,
          createdAt: d.created_at,
          authorName: (p as { name?: string })?.name || 'Member',
          authorAvatar: (p as { avatar?: string })?.avatar || '',
        };
      }),
      activities,
      analytics: {
        totalMembers: members.length,
        avgAccuracy,
        totalTeamXp,
        totalQuizzes: totalQuestionsCount,
        totalDecks: totalDecksCount,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Verify caller is admin
    const { data: membership } = await admin
      .from('memberships')
      .select('role, organization_id')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .single();

    if (!membership || !canManageWorkspace(membership.role)) {
      return NextResponse.json(
        { error: 'Only workspace admins can update settings.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: { name?: string; description?: string } = {};

    if (typeof body.name === 'string' && body.name.trim().length >= 2) {
      updateData.name = body.name.trim();
    }
    if (typeof body.description === 'string') {
      updateData.description = body.description.trim();
    }

    const { data: updatedOrg, error: updateError } = await admin
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ organization: updatedOrg });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
