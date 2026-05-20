import { createClient } from '@/lib/db/supabase-server';
import type { BlogPost } from '@/types/database';
import Link from 'next/link';

export const metadata = {
  title: 'Blog — Nanki',
  description: 'Learning science, study tips, and product updates from the Nanki team.',
};

function PostCard({ post }: { post: BlogPost }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4 bg-surface-container-lowest border border-outline-variant/50 rounded-3xl overflow-hidden hover:shadow-[0px_4px_24px_rgba(0,0,0,0.07)] transition-shadow"
    >
      {post.cover_image && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className={`flex flex-col gap-3 px-7 ${post.cover_image ? 'pb-7' : 'py-7'}`}>
        <p className="text-xs text-on-surface-variant font-medium">{date}</p>
        <h2 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-primary text-sm font-semibold mt-1">
          Read more
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const allPosts = (posts ?? []) as BlogPost[];
  const [featured, ...rest] = allPosts;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-outline-variant/40 bg-surface-container-lowest px-4 sm:px-6">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="material-symbols-outlined fill text-tertiary-container text-[24px]">psychology</span>
            <span className="text-lg font-extrabold text-primary">Nanki</span>
          </Link>
          <Link href="/auth/signin" className="text-sm font-semibold text-primary hover:underline">
            Start learning →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* Page header */}
        <div className="mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full">
            Blog
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-on-surface">
            Learning, science, and memory.
          </h1>
          <p className="mt-3 text-on-surface-variant max-w-xl">
            Study tips, cognitive science deep-dives, and product updates from the Nanki team.
          </p>
        </div>

        {allPosts.length === 0 ? (
          <div className="text-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined fill text-[48px] text-outline mb-4">article</span>
            <p className="text-lg font-semibold">No posts yet.</p>
            <p className="text-sm mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured post */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-container-lowest border border-outline-variant/50 rounded-3xl overflow-hidden hover:shadow-[0px_4px_24px_rgba(0,0,0,0.08)] transition-shadow"
              >
                {featured.cover_image ? (
                  <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img
                      src={featured.cover_image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="hidden md:flex items-center justify-center bg-primary/6">
                    <span className="material-symbols-outlined fill text-primary/30 text-[80px]">article</span>
                  </div>
                )}
                <div className="flex flex-col justify-center gap-4 p-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full w-fit">
                    Featured
                  </span>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {featured.published_at
                      ? new Date(featured.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : new Date(featured.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface group-hover:text-primary transition-colors leading-snug">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-primary text-sm font-semibold">
                    Read article
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/40 py-8 px-4 text-center text-xs text-on-surface-variant mt-16">
        <Link href="/" className="hover:text-primary transition-colors">← Back to Nanki</Link>
        <span className="mx-3 text-outline-variant">·</span>
        <span>© {new Date().getFullYear()} Nanki</span>
      </footer>
    </div>
  );
}
