import { createClient } from '@/lib/db/supabase-server';
import type { BlogPost } from '@/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  const post = data as BlogPost | null;

  if (!post) return { title: 'Post not found — Nanki' };

  return {
    title: `${post.title} — Nanki Blog`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!data) notFound();

  const post = data as BlogPost;
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-outline-variant/40 bg-surface-container-lowest px-4 sm:px-6">
        <div className="max-w-3xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="material-symbols-outlined fill text-tertiary-container text-[24px]">psychology</span>
            <span className="text-lg font-extrabold text-primary">Nanki</span>
          </Link>
          <Link href="/blog" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            All posts
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Post header */}
        <div className="mb-10">
          <p className="text-xs text-on-surface-variant font-medium mb-4">{date}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface leading-tight mb-6">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-on-surface-variant leading-relaxed border-l-4 border-primary/30 pl-5 italic">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Cover image */}
        {post.cover_image && (
          <div className="mb-10 rounded-3xl overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full object-cover max-h-[440px]"
            />
          </div>
        )}

        {/* Post body */}
        <article
          className="prose prose-neutral max-w-none prose-headings:font-extrabold prose-headings:text-on-surface prose-p:text-on-surface-variant prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-on-surface prose-blockquote:border-primary/30 prose-blockquote:text-on-surface-variant prose-code:bg-surface-container prose-code:rounded prose-code:px-1 prose-code:text-sm prose-pre:bg-surface-container prose-pre:rounded-2xl prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-20 p-8 bg-primary rounded-3xl text-center">
          <h2 className="text-xl font-extrabold text-on-primary mb-2">Ready to study smarter?</h2>
          <p className="text-on-primary/75 text-sm mb-5">
            Nanki uses the techniques in this article to help you actually remember what you study.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-on-primary text-primary font-bold text-sm px-6 py-3 rounded-full hover:bg-primary-fixed transition-all"
          >
            Start learning free
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/40 py-8 px-4 text-center text-xs text-on-surface-variant mt-8">
        <Link href="/blog" className="hover:text-primary transition-colors">← All posts</Link>
        <span className="mx-3 text-outline-variant">·</span>
        <Link href="/" className="hover:text-primary transition-colors">Nanki home</Link>
        <span className="mx-3 text-outline-variant">·</span>
        <span>© {new Date().getFullYear()} Nanki</span>
      </footer>
    </div>
  );
}
