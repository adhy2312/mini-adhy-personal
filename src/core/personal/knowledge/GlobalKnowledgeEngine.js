/**
 * ════════════════════════════════════════════════════════════════════
 *  GLOBAL KNOWLEDGE ENGINE — RAG & CITATION SYNTHESIZER
 * ════════════════════════════════════════════════════════════════════
 * Multi-tier knowledge management: distinguishes Model, Retrieved,
 * Persistent, User, and Verified Technical sources with citation scoring.
 */

import crypto from 'crypto';

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
    this.contentHashes = new Map();
    this.knowledgeGraph = new Map(); // entity -> relationships
  }

  /**
   * Ingests verified technical documentation with provenance metadata & deduplication
   */
  ingestDocument({ docId, title, content, tier = KNOWLEDGE_TIERS.TIER_E_VERIFIED_TECHNICAL, sourceUrl = null, publisher = null, confidence = 0.95, tags = [] }) {
    if (!docId || !title || !content) {
      throw new Error('docId, title, and content are required');
    }

    const contentHash = crypto.createHash('sha256').update(content.trim()).digest('hex');
    if (this.contentHashes.has(contentHash)) {
      const existingId = this.contentHashes.get(contentHash);
      return {
        status: 'DUPLICATE_SKIPPED',
        docId: existingId,
        contentHash,
        message: `Content identical to already ingested document '${existingId}'.`
      };
    }

    const entry = {
      docId,
      title,
      content,
      contentHash,
      tier,
      sourceUrl,
      publisher: publisher || 'Authoritative Source',
      confidence,
      tags: tags || [],
      ingestedAt: new Date().toISOString()
    };

    this.knowledgeBase.set(docId, entry);
    this.contentHashes.set(contentHash, docId);

    // Populate Knowledge Graph relations
    for (const tag of entry.tags) {
      if (!this.knowledgeGraph.has(tag)) {
        this.knowledgeGraph.set(tag, new Set());
      }
      this.knowledgeGraph.get(tag).add(docId);
    }

    return entry;
  }

  /**
   * Connects two entities in the persistent domain knowledge graph
   */
  linkGraphEntities(sourceEntity, relation, targetEntity) {
    if (!this.knowledgeGraph.has(sourceEntity)) {
      this.knowledgeGraph.set(sourceEntity, new Set());
    }
    const relKey = `${relation}:${targetEntity}`;
    this.knowledgeGraph.get(sourceEntity).add(relKey);
    return { linked: true, sourceEntity, relation, targetEntity };
  }

  /**
   * Retrieves knowledge graph neighbors for an entity
   */
  getGraphNeighbors(entity) {
    if (!this.knowledgeGraph.has(entity)) return [];
    return Array.from(this.knowledgeGraph.get(entity));
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
          confidence: doc.confidence,
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

  /**
   * Contradiction Detector: Evaluates two statements on the same topic for direct factual contradictions
   */
  detectContradiction(claimA, claimB) {
    const normalize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const a = normalize(claimA);
    const b = normalize(claimB);

    const opposingPairs = [
      ['safe', 'dangerous'],
      ['compliant', 'violation'],
      ['open', 'closed'],
      ['active', 'disabled'],
      ['true', 'false'],
      ['positive', 'negative']
    ];

    let hasContradiction = false;
    let conflictCategory = null;

    for (const [pos, neg] of opposingPairs) {
      if ((a.includes(pos) && b.includes(neg)) || (a.includes(neg) && b.includes(pos))) {
        hasContradiction = true;
        conflictCategory = `${pos.toUpperCase()}_VS_${neg.toUpperCase()}`;
        break;
      }
    }

    return {
      hasContradiction,
      conflictCategory,
      verdict: hasContradiction ? 'FACTUAL_DIVERGENCE_DETECTED' : 'NO_DIRECT_CONTRADICTION'
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

