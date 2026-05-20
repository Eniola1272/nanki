import { createClient } from '@/lib/db/supabase-server';
import { redirect, notFound } from 'next/navigation';
import PostForm from '../../PostForm';
import type { BlogPost } from '@/types/database';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Edit Post — Nanki Admin' };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();

  return <PostForm post={data as BlogPost} authorId={user.id} />;
}
