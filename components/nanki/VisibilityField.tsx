'use client';

export default function VisibilityField({ published, onChange }: { published: boolean; onChange: (value: boolean) => void }) {
  return <div className="rounded-xl border border-outline-variant p-4 space-y-2">
    <label className="flex items-center justify-between gap-4 text-sm font-bold">
      Visibility
      <select value={published ? 'public' : 'private'} onChange={e => onChange(e.target.value === 'public')} className="bg-surface-container-low rounded-lg border border-outline-variant px-3 py-2">
        <option value="private">Private · only me</option>
        <option value="public">Public · everyone</option>
      </select>
    </label>
    <p className="text-xs text-secondary">{published ? 'After saving, anyone can find and study this content. Signed-in learners can mark it helpful.' : 'Only you can access this content. You can publish it later.'}</p>
    <p className="text-xs text-secondary">Making public content private hides it from discovery. Previously saved study results remain in learners’ histories.</p>
  </div>;
}
