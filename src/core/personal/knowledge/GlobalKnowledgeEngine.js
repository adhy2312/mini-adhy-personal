/**
 * ════════════════════════════════════════════════════════════════════
 *  GLOBAL KNOWLEDGE ENGINE — RAG & CITATION SYNTHESIZER
 * ════════════════════════════════════════════════════════════════════
 * Multi-tier knowledge management: distinguishes Model, Retrieved,
 * Persistent, User, and Verified Technical sources with citation scoring.
 */

export const KNOWLEDGE_TIERS = {
  TIER_A_MODEL: 'MODEL_PRETRAINED',
  TIER_B_RETRIEVED: 'RETRIEVED_AT_QUERY_TIME',
  TIER_C_PERSISTENT: 'LOCAL_PERSISTENT_MEMORY',
  TIER_D_USER_SPECIFIC: 'USER_SPECIFIC_PROJECT_FACT',
  TIER_E_VERIFIED_TECHNICAL: 'VERIFIED_TECHNICAL_STANDARD'
};

export class GlobalKnowledgeEngine {
  constructor() {
    this.knowledgeBase = new Map();
  }

  /**
   * Ingests verified technical documentation with provenance metadata
   */
  ingestDocument({ docId, title, content, tier = KNOWLEDGE_TIERS.TIER_E_VERIFIED_TECHNICAL, sourceUrl = null, publisher = null, confidence = 0.95 }) {
    if (!docId || !title || !content) {
      throw new Error('docId, title, and content are required');
    }

    const entry = {
      docId,
      title,
      content,
      tier,
      sourceUrl,
      publisher: publisher || 'Authoritative Source',
      confidence,
      ingestedAt: new Date().toISOString()
    };

    this.knowledgeBase.set(docId, entry);
    return entry;
  }

  /**
   * RAG Query: searches ingested documents and returns ranked excerpts with citations
   */
  queryKnowledge(queryText, limit = 3) {
    const tokens = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const scored = [];

    for (const doc of this.knowledgeBase.values()) {
      const lower = doc.content.toLowerCase();
      let matchCount = 0;
      for (const tok of tokens) {
        if (lower.includes(tok)) matchCount++;
      }

      if (matchCount > 0) {
        const score = matchCount / tokens.length;
        scored.push({
          docId: doc.docId,
          title: doc.title,
          tier: doc.tier,
          publisher: doc.publisher,
          citation: `${doc.title} (${doc.publisher || 'Technical Ref'}) [Tier: ${doc.tier}]`,
          score: parseFloat(score.toFixed(3)),
          snippet: doc.content.slice(0, 240) + '...'
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return {
      query: queryText,
      totalMatches: scored.length,
      citations: scored.slice(0, limit),
      timestamp: new Date().toISOString()
    };
  }

  getKnowledgeStats() {
    const tierCounts = {};
    for (const doc of this.knowledgeBase.values()) {
      tierCounts[doc.tier] = (tierCounts[doc.tier] || 0) + 1;
    }
    return {
      totalDocuments: this.knowledgeBase.size,
      tierBreakdown: tierCounts
    };
  }
}

