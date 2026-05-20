'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import BlogEditor from '@/components/blog/BlogEditor';
import type { BlogPost } from '@/types/database';

interface PostFormProps {
  post?: BlogPost;
  authorId: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function PostForm({ post, authorId }: PostFormProps) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const handleSlugChange = (value: string) => {
    setSlug(slugify(value));
    setSlugEdited(true);
  };

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
  }, []);

  const save = async (publish: boolean) => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!slug.trim()) { setError('Slug is required.'); return; }
    setError('');
    setSaving(true);

    const supabase = createClient();
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      cover_image: coverImage.trim() || null,
      content,
      published: publish,
      published_at: publish ? (post?.published_at ?? new Date().toISOString()) : post?.published_at ?? null,
      author_id: authorId,
      updated_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    if (isEdit && post) {
      const { error: err } = await db
        .from('blog_posts')
        .update(payload)
        .eq('id', post.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await db
        .from('blog_posts')
        .insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    router.push('/admin/blog');
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push('/admin/blog')}
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          All posts
        </button>
        <span className="text-outline-variant">/</span>
        <span className="text-sm font-semibold text-on-surface">
          {isEdit ? 'Edit post' : 'New post'}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className="w-full text-3xl font-extrabold text-on-surface bg-transparent outline-none placeholder:text-outline-variant/60 border-b-2 border-outline-variant/30 focus:border-primary pb-3 transition-colors"
          />
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Slug
            </label>
            <div className="flex items-center bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 gap-2 focus-within:border-primary transition-colors">
              <span className="text-xs text-on-surface-variant whitespace-nowrap">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 text-sm font-mono text-on-surface bg-transparent outline-none"
                placeholder="post-slug"
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Cover image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="A short description shown on the blog listing page..."
            className="bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Cover preview */}
        {coverImage && (
          <div className="rounded-2xl overflow-hidden max-h-56">
            <img src={coverImage} alt="Cover preview" className="w-full object-cover max-h-56" />
          </div>
        )}

        {/* Editor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
            Content
          </label>
          <BlogEditor content={content} onChange={handleContentChange} />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-error bg-error/8 border border-error/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pt-2 border-t border-outline-variant/30">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="flex items-center gap-2 bg-surface-container border border-outline-variant/50 text-on-surface font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-surface-container-high transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-on-primary font-bold text-sm px-6 py-2.5 rounded-full hover:bg-primary-container transition-all shadow-[0px_4px_16px_rgba(0,64,126,0.2)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">publish</span>
            {post?.published ? 'Update & keep published' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
