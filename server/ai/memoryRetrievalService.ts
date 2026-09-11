import { db, CreativeMemoryItemRecord, MemoryBlockRuleRecord, CreativeMemoryCategory, CreativeMemoryScope } from "../db";

export interface MemoryRetrievalOptions {
  query?: string;
  entityType?: 'release' | 'campaign' | 'project' | 'studio_project' | 'identity' | 'product' | 'asset';
  entityId?: string;
  category?: CreativeMemoryCategory;
  scope?: CreativeMemoryScope;
  limit?: number;
  minConfidence?: number;
  includeArchived?: boolean;
}

export interface RankedMemory {
  memory: CreativeMemoryItemRecord;
  relevanceScore: number;
  retrievalReason: string;
}

export interface MemoryRetrievalResponse {
  memories: CreativeMemoryItemRecord[];
  rankedItems: RankedMemory[];
  promptContext: string;
  transparencySummaries: {
    id: string;
    title: string;
    category: string;
    scope: string;
    reason: string;
    snippet: string;
  }[];
}

export class MemoryRetrievalService {
  /**
   * Retrieves targeted, relevance-scored creative memories for a given workspace and context.
   * Strict workspace isolation is enforced.
   */
  public static retrieve(
    workspaceId: string,
    options: MemoryRetrievalOptions = {}
  ): MemoryRetrievalResponse {
    const limit = options.limit || 8;
    const minConfidence = options.minConfidence || 60;

    // 1. Fetch raw items from isolated workspace
    let allItems = db.getCreativeMemoryItems(workspaceId, {
      status: options.includeArchived ? undefined : 'active',
      category: options.category,
    });

    // 2. Fetch block rules to prevent leaking blacklisted concepts
    const blockRules = db.getMemoryBlockRules(workspaceId);
    if (blockRules.length > 0) {
      allItems = allItems.filter((item) => {
        const textToCheck = `${item.title} ${item.content} ${(item.tags || []).join(' ')}`.toLowerCase();
        for (const rule of blockRules) {
          const pattern = rule.pattern.toLowerCase();
          if (pattern && textToCheck.includes(pattern)) {
            return false;
          }
        }
        return true;
      });
    }

    // 3. Filter out superseded memories by default unless querying specific history
    const activeLineageItems = allItems.filter((item) => !item.supersededByMemoryId);

    // 4. Score each memory based on entity match, scope, pinned status, text relevance & confidence
    const queryTokens = (options.query || '')
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 2);

    const ranked: RankedMemory[] = activeLineageItems.map((item) => {
      let score = 0;
      const reasons: string[] = [];

      // A. Entity Direct Match (+40 points)
      if (options.entityId && item.entityId === options.entityId) {
        score += 40;
        reasons.push(`Direct entity match (${item.entityName || item.entityType})`);
      } else if (options.entityType && item.entityType === options.entityType) {
        score += 20;
        reasons.push(`Entity type match (${options.entityType})`);
      }

      // B. Key Memory / Pinned Boost (+25 points)
      if (item.isPinned) {
        score += 25;
        reasons.push('Key Pinned Memory');
      }

      // C. Scope Hierarchy Boost
      if (item.scope === 'workspace') {
        score += 15;
        reasons.push('Global Workspace Standard');
      } else if (options.scope && item.scope === options.scope) {
        score += 20;
        reasons.push(`Matching scope (${options.scope})`);
      }

      // D. Category Boost (Rules & Guardrails are always critical)
      if (item.category === 'rule') {
        score += 20;
        reasons.push('Brand Guardrail / Safety Standard');
      } else if (item.category === 'identity') {
        score += 15;
        reasons.push('Core Identity Knowledge');
      }

      // E. Confidence Weight (up to +15 points)
      const confWeight = Math.round((item.confidence / 100) * 15);
      score += confWeight;

      // F. Text / Query Semantic Matching (up to +30 points)
      if (queryTokens.length > 0) {
        const itemText = `${item.title} ${item.content} ${(item.tags || []).join(' ')}`.toLowerCase();
        let matchCount = 0;
        for (const token of queryTokens) {
          if (itemText.includes(token)) {
            matchCount++;
          }
        }
        if (matchCount > 0) {
          const matchScore = Math.min(30, matchCount * 8);
          score += matchScore;
          reasons.push(`Keyword match (${matchCount} term${matchCount > 1 ? 's' : ''})`);
        }
      }

      // Clamp score to 100
      const finalScore = Math.min(100, Math.max(1, score));
      const finalReason = reasons.length > 0 ? reasons.join(' • ') : 'Standard workspace context';

      return {
        memory: item,
        relevanceScore: finalScore,
        retrievalReason: finalReason,
      };
    });

    // 5. Sort by relevanceScore descending
    ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 6. Slice to top N items meeting minimum confidence
    const selectedRanked = ranked
      .filter((r) => r.memory.confidence >= minConfidence)
      .slice(0, limit);

    const selectedMemories = selectedRanked.map((r) => r.memory);

    // 7. Format context block for AI Prompt
    const promptContext = MemoryRetrievalService.formatForPrompt(selectedRanked);

    // 8. Generate transparency summary for UI citations
    const transparencySummaries = selectedRanked.map((r) => ({
      id: r.memory.id,
      title: r.memory.title,
      category: r.memory.category,
      scope: r.memory.scope,
      reason: r.retrievalReason,
      snippet: r.memory.content.length > 120 ? r.memory.content.substring(0, 117) + '...' : r.memory.content,
    }));

    return {
      memories: selectedMemories,
      rankedItems: selectedRanked,
      promptContext,
      transparencySummaries,
    };
  }

  /**
   * Formats retrieved memories into a clean, dense prompt block for Gemini.
   */
  public static formatForPrompt(rankedItems: RankedMemory[]): string {
    if (rankedItems.length === 0) {
      return "No specific long-term creative memories loaded for this request.";
    }

    const lines: string[] = [
      "=== PERSISTENT CREATIVE MEMORY (VERIFIED USER KNOWLEDGE) ===",
      "You must honor and align with the following persistent preferences, decisions, and guardrails:",
    ];

    for (const r of rankedItems) {
      const m = r.memory;
      const scopeLabel = m.scope === 'workspace' ? 'Global' : `${m.scope.toUpperCase()}${m.entityName ? ` (${m.entityName})` : ''}`;
      lines.push(`• [${m.category.toUpperCase()} | ${scopeLabel} | Conf: ${m.confidence}%] ${m.title}`);
      lines.push(`  Details: ${m.content}`);
      if (m.tags && m.tags.length > 0) {
        lines.push(`  Tags: #${m.tags.join(' #')}`);
      }
    }

    lines.push("==========================================================");
    return lines.join('\n');
  }

  /**
   * Inspects a user message and system response to check if an enduring preference was declared.
   * If detected, returns a candidate proposal for user confirmation.
   */
  public static detectMemoryCandidate(
    workspaceId: string,
    userPrompt: string,
    assistantResponse: string
  ): { shouldPropose: boolean; candidate?: { title: string; content: string; category: CreativeMemoryCategory; tags: string[] } } {
    const text = userPrompt.toLowerCase();

    // Enduring preference triggers
    const preferenceTriggers = [
      'always use',
      'never use',
      'from now on',
      'our brand tone is',
      'our visual style is',
      'remember that',
      'note down that',
      'standard for all releases',
      'our target audience is',
      'brand guideline',
      'do not say',
      'must include'
    ];

    const matchedTrigger = preferenceTriggers.find((t) => text.includes(t));
    if (!matchedTrigger) {
      return { shouldPropose: false };
    }

    // Determine category
    let category: CreativeMemoryCategory = 'preference';
    if (text.includes('audience') || text.includes('target') || text.includes('demographic')) {
      category = 'strategy';
    } else if (text.includes('never') || text.includes('do not') || text.includes('ban') || text.includes('prohibit')) {
      category = 'rule';
    } else if (text.includes('visual') || text.includes('color') || text.includes('font') || text.includes('artwork')) {
      category = 'preference';
    } else if (text.includes('artist') || text.includes('identity') || text.includes('story')) {
      category = 'identity';
    }

    const title = userPrompt.length > 60 ? userPrompt.substring(0, 57) + '...' : userPrompt;
    const content = `Captured user instruction: "${userPrompt}"`;
    const tags = ['ai-extracted', category, matchedTrigger.replace(/\s+/g, '-')];

    return {
      shouldPropose: true,
      candidate: {
        title: `Preference: ${title}`,
        content,
        category,
        tags,
      },
    };
  }
}
