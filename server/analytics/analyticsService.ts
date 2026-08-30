import { db, PerformanceMetricRecord, GrowthInsightRecord, WorkspaceGoalRecord, ContentItemRecord, ReleaseRecord, CampaignRecord } from "../db.js";
import { 
  AnalyticsSummaryDashboard, 
  PlatformPerformanceSummary, 
  FormatPerformanceSummary, 
  PillarPerformanceSummary, 
  CampaignPerformanceSummary, 
  ReleasePerformanceSummary,
  PerformanceTrendPoint,
  TopContentItemSummary,
  ActiveTab
} from "../../src/types.js";

export class AnalyticsService {
  /**
   * Generates the comprehensive analytics & growth summary for a workspace
   */
  public getAnalyticsSummary(workspaceId: string): any {
    const metrics = db.getPerformanceMetrics(workspaceId);
    const contentItems = db.getContentItems(workspaceId);
    const campaigns = db.getCampaigns(workspaceId);
    const releases = db.getReleases(workspaceId);
    const pillars = db.getContentPillars(workspaceId);
    const insights = db.getGrowthInsights(workspaceId);
    const goals = db.getWorkspaceGoals(workspaceId);

    // 1. Overall Aggregates
    let totalViews = 0;
    let totalReach = 0;
    let totalImpressions = 0;
    let totalStreams = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalSpend = 0;
    let engagementSum = 0;
    let engagementCount = 0;

    const sourceBreakdown: Record<string, number> = {
      manual: 0,
      imported: 0,
      api: 0,
      calculated: 0,
    };

    metrics.forEach((m) => {
      sourceBreakdown[m.source] = (sourceBreakdown[m.source] || 0) + 1;
      if (m.metrics.views) totalViews += m.metrics.views;
      if (m.metrics.reach) totalReach += m.metrics.reach;
      if (m.metrics.impressions) totalImpressions += m.metrics.impressions;
      if (m.metrics.streams) totalStreams += m.metrics.streams;
      if (m.metrics.conversions) totalConversions += m.metrics.conversions;
      if (m.metrics.revenue) totalRevenue += m.metrics.revenue;
      if (m.metrics.spend) totalSpend += m.metrics.spend;
      if (m.metrics.engagement) {
        engagementSum += m.metrics.engagement;
        engagementCount++;
      }
    });

    const averageEngagementRate = engagementCount > 0 ? Number((engagementSum / engagementCount).toFixed(1)) : 0;

    // 2. Platform Breakdown
    const platformMap = new Map<string, {
      views: number;
      reach: number;
      engSum: number;
      engCount: number;
      conversions: number;
      metricCount: number;
      topTitle: string;
      topViews: number;
    }>();

    metrics.forEach((m) => {
      const plat = m.platform || "other";
      const cur = platformMap.get(plat) || {
        views: 0,
        reach: 0,
        engSum: 0,
        engCount: 0,
        conversions: 0,
        metricCount: 0,
        topTitle: "",
        topViews: 0,
      };

      const mViews = m.metrics.views || 0;
      cur.views += mViews;
      cur.reach += m.metrics.reach || 0;
      cur.conversions += m.metrics.conversions || 0;
      cur.metricCount += 1;

      if (m.metrics.engagement) {
        cur.engSum += m.metrics.engagement;
        cur.engCount += 1;
      }

      if (mViews > cur.topViews) {
        cur.topViews = mViews;
        cur.topTitle = m.entityTitle;
      }

      platformMap.set(plat, cur);
    });

    const platformPerformance: PlatformPerformanceSummary[] = Array.from(platformMap.entries()).map(([platform, data]) => {
      const shareOfTotal = totalViews > 0 ? Number(((data.views / totalViews) * 100).toFixed(1)) : 0;
      const avgEngagement = data.engCount > 0 ? Number((data.engSum / data.engCount).toFixed(1)) : 0;

      return {
        platform: platform as any,
        contentCount: data.metricCount,
        totalViews: data.views,
        totalReach: data.reach,
        totalEngagement: data.engSum,
        avgEngagementRate: avgEngagement,
        totalConversions: data.conversions,
        shareOfTotalViews: shareOfTotal,
        topPerformingTitle: data.topTitle || "No title recorded",
      };
    }).sort((a, b) => b.totalViews - a.totalViews);

    // 3. Format Breakdown
    const formatMap = new Map<string, {
      viewsSum: number;
      engSum: number;
      engCount: number;
      count: number;
      topTitle: string;
      topViews: number;
    }>();

    metrics.forEach((m) => {
      const fmt = m.format || (m.entityType === "content" ? "Short Video" : "Standard");
      const cur = formatMap.get(fmt) || {
        viewsSum: 0,
        engSum: 0,
        engCount: 0,
        count: 0,
        topTitle: "",
        topViews: 0,
      };

      const mViews = m.metrics.views || 0;
      cur.viewsSum += mViews;
      cur.count += 1;
      if (m.metrics.engagement) {
        cur.engSum += m.metrics.engagement;
        cur.engCount += 1;
      }
      if (mViews > cur.topViews) {
        cur.topViews = mViews;
        cur.topTitle = m.entityTitle;
      }
      formatMap.set(fmt, cur);
    });

    const formatPerformance: FormatPerformanceSummary[] = Array.from(formatMap.entries()).map(([format, data]) => {
      return {
        format,
        contentCount: data.count,
        totalViews: data.viewsSum,
        avgViews: data.count > 0 ? Math.round(data.viewsSum / data.count) : 0,
        avgEngagementRate: data.engCount > 0 ? Number((data.engSum / data.engCount).toFixed(1)) : 0,
        topPerformingSample: data.topTitle || "Sample title",
      };
    }).sort((a, b) => b.avgViews - a.avgViews);

    // 4. Pillar Breakdown
    const pillarMap = new Map<string, {
      name: string;
      viewsSum: number;
      engSum: number;
      engCount: number;
      count: number;
    }>();

    pillars.forEach((p) => {
      pillarMap.set(p.name, {
        name: p.name,
        viewsSum: 0,
        engSum: 0,
        engCount: 0,
        count: 0,
      });
    });

    contentItems.forEach((item) => {
      const pName = item.contentPillar || "Uncategorized";
      const cur = pillarMap.get(pName) || {
        name: pName,
        viewsSum: 0,
        engSum: 0,
        engCount: 0,
        count: 0,
      };
      cur.count += 1;

      // Find metric for this content item if available
      const itemMetrics = metrics.filter((m) => m.entityId === item.id);
      itemMetrics.forEach((im) => {
        if (im.metrics.views) cur.viewsSum += im.metrics.views;
        if (im.metrics.engagement) {
          cur.engSum += im.metrics.engagement;
          cur.engCount += 1;
        }
      });

      pillarMap.set(pName, cur);
    });

    const pillarPerformance: PillarPerformanceSummary[] = Array.from(pillarMap.entries()).map(([pillarName, data]) => {
      const avgViews = data.count > 0 && data.viewsSum > 0 ? Math.round(data.viewsSum / data.count) : 0;
      const avgEng = data.engCount > 0 ? Number((data.engSum / data.engCount).toFixed(1)) : 0;
      return {
        pillar: pillarName,
        pillarName,
        contentCount: data.count,
        totalViews: data.viewsSum,
        avgViews,
        avgEngagementRate: avgEng,
      };
    }).sort((a, b) => (b.avgViews || 0) - (a.avgViews || 0));

    // 5. Campaign Performance
    const campaignPerformance: CampaignPerformanceSummary[] = campaigns.map((c) => {
      const campMetrics = metrics.filter((m) => m.entityId === c.id || (m.entityType === "campaign" && m.entityTitle === c.title));
      let cViews = 0;
      let cConversions = 0;
      let cSpend = 0;
      let cRev = 0;

      campMetrics.forEach((m) => {
        if (m.metrics.views) cViews += m.metrics.views;
        if (m.metrics.impressions) cViews += m.metrics.impressions;
        if (m.metrics.conversions) cConversions += m.metrics.conversions;
        if (m.metrics.spend) cSpend += m.metrics.spend;
        if (m.metrics.revenue) cRev += m.metrics.revenue;
      });

      const actualSpend = cSpend || c.budget || 0;
      const actualRev = cRev || 0;
      const roi = actualSpend > 0 ? Number((((actualRev - actualSpend) / actualSpend) * 100).toFixed(1)) : 0;

      return {
        campaignId: c.id,
        title: c.title,
        status: c.status,
        spend: actualSpend,
        impressions: cViews,
        leadsOrSales: cConversions,
        revenue: actualRev,
        roi,
      };
    });

    // 6. Release Performance
    const releasePerformance: ReleasePerformanceSummary[] = releases.map((r) => {
      const relMetrics = metrics.filter((m) => m.entityId === r.id || (m.entityType === "release" && m.entityTitle === r.title));
      let rStreams = 0;
      let rSaves = 0;

      relMetrics.forEach((m) => {
        if (m.metrics.streams) rStreams += m.metrics.streams;
        if (m.metrics.saves) rSaves += m.metrics.saves;
      });

      const relContent = contentItems.filter((c) => c.releaseId === r.id);
      // Momentum score based on streams, saves, content volume
      const momentumScore = Math.min(100, Math.round((rStreams > 0 ? 40 : 10) + (rSaves > 0 ? 30 : 10) + (relContent.length * 5)));

      return {
        releaseId: r.id,
        title: r.title,
        stage: r.status,
        streams: rStreams,
        saves: rSaves,
        contentCount: relContent.length,
        momentumScore,
      };
    });

    // 7. Trends
    // Aggregate by metricDate
    const dateMap = new Map<string, { views: number; engagementSum: number; engagementCount: number; conversions: number; revenue: number }>();

    metrics.forEach((m) => {
      const date = m.metricDate || m.createdAt.substring(0, 10);
      const cur = dateMap.get(date) || { views: 0, engagementSum: 0, engagementCount: 0, conversions: 0, revenue: 0 };
      if (m.metrics.views) cur.views += m.metrics.views;
      if (m.metrics.conversions) cur.conversions += m.metrics.conversions;
      if (m.metrics.revenue) cur.revenue += m.metrics.revenue;
      if (m.metrics.engagement) {
        cur.engagementSum += m.metrics.engagement;
        cur.engagementCount += 1;
      }
      dateMap.set(date, cur);
    });

    const trends: PerformanceTrendPoint[] = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        views: data.views,
        reach: data.views,
        engagementRate: data.engagementCount > 0 ? Number((data.engagementSum / data.engagementCount).toFixed(1)) : 0,
        conversions: data.conversions,
        revenue: data.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 8. Top Performing Content
    const topContent: TopContentItemSummary[] = metrics
      .filter((m) => m.entityType === "content")
      .map((m) => {
        const item = contentItems.find((c) => c.id === m.entityId);
        return {
          contentId: m.entityId,
          title: m.entityTitle,
          platform: m.platform,
          format: m.format || item?.contentType || "Short Video",
          pillar: item?.contentPillar || "General",
          views: m.metrics.views || 0,
          engagementRate: m.metrics.engagement || 0,
          conversions: m.metrics.conversions || 0,
          source: m.source,
          isVerified: m.isVerified,
          metricDate: m.metricDate,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // 9. Underperforming Content
    const underperformingContent: TopContentItemSummary[] = metrics
      .filter((m) => m.entityType === "content" && (m.metrics.views || 0) > 0 && (m.metrics.engagement || 0) < 5.0)
      .map((m) => {
        const item = contentItems.find((c) => c.id === m.entityId);
        return {
          contentId: m.entityId,
          title: m.entityTitle,
          platform: m.platform,
          format: m.format || item?.contentType || "Short Video",
          pillar: item?.contentPillar || "General",
          views: m.metrics.views || 0,
          engagementRate: m.metrics.engagement || 0,
          conversions: m.metrics.conversions || 0,
          source: m.source,
          isVerified: m.isVerified,
          metricDate: m.metricDate,
        };
      })
      .sort((a, b) => a.engagementRate - b.engagementRate)
      .slice(0, 5);

    return {
      workspaceId,
      overall: {
        totalViews,
        totalReach,
        totalImpressions,
        totalStreams,
        totalConversions,
        totalRevenue,
        totalSpend,
        averageEngagementRate,
        totalContentPublished: contentItems.filter((c) => c.status === "ready" || c.status === "scheduled" || c.status === "approved").length,
        activeCampaignsCount: campaigns.filter((c) => c.status === "active" || c.status === "planning" || c.status === "ready").length,
        releasesTrackedCount: releases.length,
      },
      platformPerformance,
      formatPerformance,
      pillarPerformance,
      campaignPerformance,
      releasePerformance,
      trends,
      topContent,
      underperformingContent,
      insights: insights.filter((i) => i.status !== "dismissed"),
      goals,
      sourceBreakdown: {
        manual: sourceBreakdown.manual || 0,
        imported: sourceBreakdown.imported || 0,
        api: sourceBreakdown.api || 0,
        calculated: sourceBreakdown.calculated || 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Evaluates performance data and creates new AI growth insights
   */
  public generateGrowthInsights(workspaceId: string): GrowthInsightRecord[] {
    const summary = this.getAnalyticsSummary(workspaceId);
    const generated: GrowthInsightRecord[] = [];

    // Rule 1: High-performing format detection
    if (summary.formatPerformance.length >= 2) {
      const bestFormat = summary.formatPerformance[0];
      const secondFormat = summary.formatPerformance[1];
      if (bestFormat.avgViews > secondFormat.avgViews * 1.5) {
        const ratio = (bestFormat.avgViews / (secondFormat.avgViews || 1)).toFixed(1);
        const insight = db.createGrowthInsight(workspaceId, {
          title: `${bestFormat.format} is outperforming ${secondFormat.format} by ${ratio}x in average reach`,
          explanation: `Content published in the ${bestFormat.format} format achieves an average of ${bestFormat.avgViews.toLocaleString()} views with ${bestFormat.avgEngagementRate}% engagement rate.`,
          evidence: `Analyzed ${summary.overall.totalContentPublished} content records. Top performing sample: "${bestFormat.topPerformingSample || "Hero Sample"}".`,
          relatedEntity: {
            type: "format",
            name: bestFormat.format,
          },
          confidence: "high",
          category: "content_format",
          status: "active",
          recommendedAction: {
            label: `Queue 2 Additional ${bestFormat.format} concepts in Content Engine`,
            actionType: "create_content",
            targetTab: "content-engine",
            payload: { format: bestFormat.format },
          },
        });
        generated.push(insight);
      }
    }

    // Rule 2: Top conversion platform momentum
    if (summary.platformPerformance.length > 0) {
      const topPlat = summary.platformPerformance[0];
      if (topPlat.totalConversions && topPlat.totalConversions > 0) {
        const insight = db.createGrowthInsight(workspaceId, {
          title: `${String(topPlat.platform).toUpperCase()} is driving the highest conversion volume (${topPlat.totalConversions} actions)`,
          explanation: `${String(topPlat.platform).toUpperCase()} accounts for ${topPlat.shareOfTotalViews || 0}% of all viewer reach and has generated ${topPlat.totalConversions} direct presaves/conversions.`,
          evidence: `${topPlat.totalViews.toLocaleString()} total views across published items.`,
          relatedEntity: {
            type: "platform",
            name: topPlat.platform,
          },
          confidence: "high",
          category: "platform_momentum",
          status: "active",
          recommendedAction: {
            label: `Double down on ${topPlat.platform} release distribution`,
            actionType: "navigate_tab",
            targetTab: "content-engine",
          },
        });
        generated.push(insight);
      }
    }

    // Rule 3: Goal progress risk detection
    (summary.goals || []).forEach((goal: WorkspaceGoalRecord) => {
      const progressPercent = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
      if (progressPercent < 30 && goal.deadline) {
        const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 14 && daysLeft > 0) {
          const insight = db.createGrowthInsight(workspaceId, {
            title: `Goal "${goal.title}" is currently at ${Math.round(progressPercent)}% with ${daysLeft} days remaining`,
            explanation: `Current metric progress (${goal.currentValue} / ${goal.targetValue} ${goal.unit}) is pacing behind schedule. A targeted sprint push or content burst is recommended.`,
            evidence: `Goal ID ${goal.id} created on ${goal.createdAt.substring(0, 10)} due on ${goal.deadline}.`,
            relatedEntity: {
              type: "workspace",
              name: goal.title,
              id: goal.id,
            },
            confidence: "medium",
            category: "growth_opportunity",
            status: "active",
            recommendedAction: {
              label: "Review Goal & Create Targeted Campaign Push",
              actionType: "navigate_tab",
              targetTab: "brand-os" as ActiveTab,
            },
          });
          generated.push(insight);
        }
      }
    });

    return generated;
  }

  /**
   * Promotes an insight directly to Creative Memory to complete the learning loop
   */
  public saveInsightToMemory(
    workspaceId: string,
    userId: string,
    insightId: string
  ): { memoryId: string; insight: GrowthInsightRecord } {
    const insight = db.getGrowthInsightById(workspaceId, insightId);
    if (!insight) {
      throw new Error("Growth insight not found");
    }

    const memoryItem = db.createCreativeMemoryItem(workspaceId, {
      userId,
      category: "strategy",
      scope: "workspace",
      title: `Analytics Learning: ${insight.title}`,
      content: `${insight.explanation}\n\nEvidence: ${insight.evidence}`,
      tags: ["analytics", "growth", insight.category, insight.relatedEntity.name.toLowerCase()],
      source: "ai_extracted",
      confidence: insight.confidence === "high" ? 95 : 80,
      status: "active",
      isPinned: false,
    });

    db.updateGrowthInsight(workspaceId, insightId, {
      status: "saved_to_memory",
      savedMemoryId: memoryItem.id,
    });

    return {
      memoryId: memoryItem.id,
      insight: db.getGrowthInsightById(workspaceId, insightId)!,
    };
  }
}

export const analyticsService = new AnalyticsService();
