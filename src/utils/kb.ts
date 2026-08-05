export interface KbChunk {
  id: string;
  sourceName: string;
  content: string;
  score: number;
}

export function filterKbChunksByRelevance(chunks: KbChunk[], threshold: number = 0.78): KbChunk[] {
  return chunks.filter((c) => c.score >= threshold);
}

export function formatKbCitation(chunk: KbChunk): string {
  return `[${chunk.sourceName}] (Score: ${chunk.score}): "${chunk.content.slice(0, 100)}..."`;
}
