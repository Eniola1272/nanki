'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useEffect } from 'react';

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
        active
          ? 'bg-primary text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-outline-variant/50 mx-1" />;
}

export default function BlogEditor({ content, onChange, placeholder = 'Write your post...' }: BlogEditorProps) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [htmlSource, setHtmlSource] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline underline-offset-2' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-2xl max-w-full my-4' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setHtmlSource(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral max-w-none outline-none min-h-[320px] px-6 py-5 text-on-surface',
      },
    },
  });

  // Sync editor → htmlSource whenever mode switches to html
  const switchToHtml = useCallback(() => {
    if (editor) setHtmlSource(editor.getHTML());
    setMode('html');
  }, [editor]);

  // When switching back to visual, push htmlSource into editor
  const switchToVisual = useCallback(() => {
    if (editor) {
      editor.commands.setContent(htmlSource);
      onChange(htmlSource);
    }
    setMode('visual');
  }, [editor, htmlSource, onChange]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (!url || !editor) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (!url || !editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  // Keep htmlSource in sync with prop changes (e.g., loading existing post)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      setHtmlSource(content);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  return (
    <div className="border border-outline-variant/50 rounded-2xl overflow-hidden bg-surface-container-lowest">
      {/* Toolbar */}
      <div className="border-b border-outline-variant/40 bg-surface-container-low px-3 py-2 flex flex-wrap items-center gap-0.5">
        {/* Text style */}
        <ToolbarButton
          title="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
          disabled={mode === 'html'}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
          disabled={mode === 'html'}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive('underline')}
          disabled={mode === 'html'}
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive('strike')}
          disabled={mode === 'html'}
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          title="Heading 1"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor?.isActive('heading', { level: 1 })}
          disabled={mode === 'html'}
        >
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive('heading', { level: 2 })}
          disabled={mode === 'html'}
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive('heading', { level: 3 })}
          disabled={mode === 'html'}
        >
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          title="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList')}
          disabled={mode === 'html'}
        >
          <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList')}
          disabled={mode === 'html'}
        >
          <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block */}
        <ToolbarButton
          title="Blockquote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive('blockquote')}
          disabled={mode === 'html'}
        >
          <span className="material-symbols-outlined text-[16px]">format_quote</span>
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive('codeBlock')}
          disabled={mode === 'html'}
        >
          <span className="material-symbols-outlined text-[16px]">code</span>
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal rule"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          disabled={mode === 'html'}
        >
          <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Insert */}
        <ToolbarButton
          title="Add link"
          onClick={addLink}
          active={editor?.isActive('link')}
          disabled={mode === 'html'}
        >
          <span className="material-symbols-outlined text-[16px]">link</span>
        </ToolbarButton>
        <ToolbarButton
          title="Add image"
          onClick={addImage}
          disabled={mode === 'html'}
        >
          <span className="material-symbols-outlined text-[16px]">image</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* History */}
        <ToolbarButton
          title="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={mode === 'html' || !editor?.can().undo()}
        >
          <span className="material-symbols-outlined text-[16px]">undo</span>
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={mode === 'html' || !editor?.can().redo()}
        >
          <span className="material-symbols-outlined text-[16px]">redo</span>
        </ToolbarButton>

        {/* HTML toggle — pushed to right */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={mode === 'visual' ? switchToHtml : switchToVisual}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              mode === 'html'
                ? 'bg-primary text-on-primary border-primary'
                : 'border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">code</span>
            {mode === 'html' ? 'Visual' : 'HTML'}
          </button>
        </div>
      </div>

      {/* Editor body */}
      {mode === 'visual' ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={htmlSource}
          onChange={(e) => setHtmlSource(e.target.value)}
          className="w-full min-h-[320px] px-6 py-5 font-mono text-sm text-on-surface bg-surface-container-lowest outline-none resize-y"
          spellCheck={false}
          placeholder="<p>Write HTML here...</p>"
        />
      )}
    </div>
  );
}
