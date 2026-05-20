import { createClient } from '@/lib/db/supabase-server';
import type { BlogPost } from '@/types/database';
import Link from 'next/link';
import AdminBlogActions from './AdminBlogActions';

export const metadata = { title: 'Blog Posts — Nanki Admin' };

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  const posts = (data ?? []) as BlogPost[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface">Blog posts</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {posts.length} post{posts.length !== 1 ? 's' : ''} total &mdash;{' '}
            {posts.filter((p) => p.published).length} published
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-full hover:bg-primary-container transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New post
        </Link>
      </div>

      {/* Posts table */}
      {posts.length === 0 ? (
        <div className="text-center py-24 border border-outline-variant/40 rounded-3xl text-on-surface-variant">
          <span className="material-symbols-outlined fill text-[48px] text-outline mb-3 block">article</span>
          <p className="font-semibold">No posts yet.</p>
          <Link href="/admin/blog/new" className="text-primary text-sm font-semibold mt-2 inline-block hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="border border-outline-variant/40 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/40 text-xs text-on-surface-variant font-semibold uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {posts.map((post) => (
                <tr key={post.id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-on-surface truncate max-w-xs">{post.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">/blog/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1 bg-tertiary-container/30 text-tertiary text-xs font-bold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary inline-block" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant text-xs font-bold px-2.5 py-1 rounded-full border border-outline-variant/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline inline-block" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant hidden md:table-cell">
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <AdminBlogActions post={post} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
