'use client';

import { createClient } from '@/lib/db/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import type { BlogPost } from '@/types/database';

export default function AdminBlogActions({ post }: { post: BlogPost }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const togglePublish = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from('blog_posts')
      .update({
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : post.published_at,
      })
      .eq('id', post.id);
    router.refresh();
    setLoading(false);
  };

  const deletePost = async () => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from('blog_posts').delete().eq('id', post.id);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <Link
        href={`/admin/blog/${post.id}/edit`}
        className="flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[14px]">edit</span>
        Edit
      </Link>
      <button
        onClick={togglePublish}
        disabled={loading}
        className="flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-surface-container disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[14px]">
          {post.published ? 'unpublished' : 'publish'}
        </span>
        {post.published ? 'Unpublish' : 'Publish'}
      </button>
      <button
        onClick={deletePost}
        disabled={loading}
        className="flex items-center gap-1 text-xs font-semibold text-error/70 hover:text-error transition-colors px-2 py-1.5 rounded-lg hover:bg-error/5 disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[14px]">delete</span>
        Delete
      </button>
    </div>
  );
}
