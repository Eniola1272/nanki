import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { validateReportInput } from '@/lib/community/moderation';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in to submit a content report.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateReportInput({
      kind: body.kind,
      contentId: body.contentId,
      reason: body.reason,
      details: body.details,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const admin = createAdminClient();

    const insertPayload = {
      user_id: user.id,
      quiz_id: body.kind === 'quiz' ? body.contentId : null,
      deck_id: body.kind === 'deck' ? body.contentId : null,
      reason: body.reason,
      details: typeof body.details === 'string' ? body.details.trim() : null,
    };

    const { error: insertError } = await admin
      .from('content_reports')
      .insert(insertPayload);

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: true,
          alreadyReported: true,
          message: 'You have already reported this item. Our moderation team is investigating.',
        });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully. Thank you for keeping Nanki helpful and safe.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
