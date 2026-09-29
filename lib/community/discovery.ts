import type { Quiz, Deck } from '../../types/nanki';

export type SearchResult = { kind: 'quiz'; content: Quiz } | { kind: 'deck'; content: Deck };
export function discoverContent(quizzes: Quiz[], decks: Deck[], query: string, category: string, sort: 'helpful' | 'newest') {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [
    ...quizzes.map(content => ({ kind: 'quiz' as const, content })),
    ...decks.map(content => ({ kind: 'deck' as const, content })),
  ];
  return results.filter(({ content }) => {
    // Local starter content has no database owner. Private database rows never
    // enter search, even when the current user is their author.
    if (!content.published && content.ownerId !== undefined) return false;
    const text = `${content.title} ${content.description} ${content.category}`.toLowerCase();
    return terms.every(term => text.includes(term)) && (category === 'All Topics' || content.category === category);
  }).sort((a, b) => {
    if (sort === 'helpful') {
      const votes = (b.content.likeCount ?? 0) - (a.content.likeCount ?? 0);
      if (votes) return votes;
    }
    const date = (b.content.createdAt ?? '').localeCompare(a.content.createdAt ?? '');
    return date || a.content.title.localeCompare(b.content.title) || a.content.id.localeCompare(b.content.id);
  });
}
