/**
 * ════════════════════════════════════════════════════════════════════
 *  EMPATHETIC COMPANION NEXUS — PERSONAL CONTINUITY & ACTIVE LISTENING
 * ════════════════════════════════════════════════════════════════════
 * Recognizes emotional nuances, conversational intents (Solution, Discussion,
 * Advice, Emotional Support, Distraction, or Active Listening), and provides
 * thoughtful companionship without forced productivity unsolicited lectures.
 */

export const CONVERSATION_INTENTS = {
  SOLUTION: 'PRACTICAL_SOLUTION_REQUESTED',
  DISCUSSION: 'THOUGHTFUL_DISCUSSION',
  ADVICE: 'SEEKING_ADVICE',
  EMOTIONAL_SUPPORT: 'EMOTIONAL_SUPPORT_NEEDED',
  DISTRACTION: 'DISTRACTION_OR_HUMOR',
  ACTIVE_LISTENING: 'ACTIVE_LISTENING_DESIRED'
};

export class EmpatheticCompanionNexus {
  /**
   * Classifies user conversational intent and emotional tone
   */
  classifyIntent(message) {
    const lower = message.toLowerCase();

    if (lower.includes('feel overwhelmed') || lower.includes('exhausted') || lower.includes('tired of this') || lower.includes('stressed')) {
      return {
        intent: CONVERSATION_INTENTS.EMOTIONAL_SUPPORT,
        tone: 'EMPATHETIC_COMFORT',
        approach: 'Acknowledge feeling, listen attentively, avoid rushing to unsolicited task lists.'
      };
    }

    if (lower.includes('just wanted to share') || lower.includes('hear me out') || lower.includes('listening')) {
      return {
        intent: CONVERSATION_INTENTS.ACTIVE_LISTENING,
        tone: 'ATTENTIVE_PRESENCE',
        approach: 'Reflect thoughts back gently, ask clarifying reflective questions.'
      };
    }

    if (lower.includes('what should i do') || lower.includes('give me advice') || lower.includes('your perspective')) {
      return {
        intent: CONVERSATION_INTENTS.ADVICE,
        tone: 'CONSIDERATE_COUNSEL',
        approach: 'Present grounded perspectives with honest, respectful disagreement if needed.'
      };
    }

    if (lower.includes('how do i fix') || lower.includes('build this') || lower.includes('solve this bug')) {
      return {
        intent: CONVERSATION_INTENTS.SOLUTION,
        tone: 'TECHNICAL_PRECISION',
        approach: 'Deliver crisp, actionable engineering solution.'
      };
    }

    return {
      intent: CONVERSATION_INTENTS.DISCUSSION,
      tone: 'INTELLECTUAL_COMPANIONSHIP',
      approach: 'Engage thoughtfully as a collaborative peer.'
    };
  }

  /**
   * Generates a supportive, grounded response matching the detected intent
   */
  synthesizeResponse(message, context = {}) {
    const analysis = this.classifyIntent(message);

    if (analysis.intent === CONVERSATION_INTENTS.EMOTIONAL_SUPPORT) {
      return {
        analysis,
        response: `I hear you, sir. You've been carrying a heavy workload lately. We don't need to push any technical commits right now unless you want to. Take a breath; all systems and projects are securely held in memory.`,
        tone: analysis.tone
      };
    }

    if (analysis.intent === CONVERSATION_INTENTS.ACTIVE_LISTENING) {
      return {
        analysis,
        response: `I am right here with you. What part of that feels like the biggest question mark for you right now?`,
        tone: analysis.tone
      };
    }

    return {
      analysis,
      response: `Understood. Let's look at this clearly together.`,
      tone: analysis.tone
    };
  }
}

