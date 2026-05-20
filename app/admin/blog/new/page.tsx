import { createClient } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import PostForm from '../PostForm';

export const metadata = { title: 'New Post — Nanki Admin' };

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  return <PostForm authorId={user.id} />;
}
