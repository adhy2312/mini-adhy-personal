/**
 * ════════════════════════════════════════════════════════════════════
 *  DECISION INTELLIGENCE ENGINE — MULTI-CRITERIA DECISION MATRIX
 * ════════════════════════════════════════════════════════════════════
 * Synthesizes rational, evidence-based recommendations using weighted
 * criteria matrices, trade-off evaluations, and risk scoring.
 */

export const AUTONOMY_LEVELS = {
  ADVISORY: 'ADVISORY_RECOMMENDATION_ONLY',
  ASSISTED: 'ASSISTED_PREPARE_REQUEST_APPROVAL',
  SUPERVISED: 'SUPERVISED_LOW_RISK_INDEPENDENT',
  AUTONOMOUS: 'AUTONOMOUS_PRE_AUTHORIZED_BOUNDARIES'
};

export class DecisionIntelligenceEngine {
  constructor(options = {}) {
    this.defaultAutonomy = options.autonomy || AUTONOMY_LEVELS.ASSISTED;
  }

  /**
   * Evaluates decision options using multi-criteria weighted scoring
   */
  evaluateDecision({ objective, criteria = [], options = [], constraints = [] }) {
    if (!options.length || !criteria.length) {
      throw new Error('Decision evaluation requires options and weighted criteria');
    }

    // Normalize weights to sum to 1.0
    const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 1), 0);
    const normalizedCriteria = criteria.map(c => ({
      name: c.name,
      weight: (c.weight || 1) / totalWeight
    }));

    const scoredOptions = [];

    for (const opt of options) {
      let totalScore = 0;
      const breakdown = {};

      for (const crit of normalizedCriteria) {
        const rawRating = opt.scores ? (opt.scores[crit.name] || 5) : 5; // 1-10 scale
        const weighted = rawRating * crit.weight;
        totalScore += weighted;
        breakdown[crit.name] = { rawRating, weightedScore: parseFloat(weighted.toFixed(2)) };
      }

      scoredOptions.push({
        name: opt.name,
        finalScore: parseFloat(totalScore.toFixed(2)),
        pros: opt.pros || [],
        cons: opt.cons || [],
        risks: opt.risks || [],
        breakdown
      });
    }

    scoredOptions.sort((a, b) => b.finalScore - a.finalScore);
    const recommended = scoredOptions[0];

    return {
      objective,
      totalOptionsEvaluated: options.length,
      recommendedOption: recommended.name,
      recommendedScore: recommended.finalScore,
      rationale: `Option '${recommended.name}' achieved top score (${recommended.finalScore}/10) across weighted criteria.`,
      rankedOptions: scoredOptions,
      tradeOffs: {
        primaryAdvantage: recommended.pros[0] || 'Optimal criteria alignment',
        primaryRisk: recommended.risks[0] || 'Standard implementation effort'
      },
      evaluationTimestamp: new Date().toISOString()
    };
  }

  setAutonomy(level) {
    if (!Object.values(AUTONOMY_LEVELS).includes(level)) {
      throw new Error(`Invalid autonomy level: ${level}`);
    }
    this.defaultAutonomy = level;
    return { status: 'AUTONOMY_CONFIGURED', currentAutonomy: this.defaultAutonomy };
  }
}

