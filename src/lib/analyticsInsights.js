/**
 * Analytics Insights Engine
 * Generates real AI-powered insights and recommendations from user activity
 */

export const analyticsInsights = {
  /**
   * Generates insights based on aggregated analytics data
   * @param {Object} data - The aggregated analytics from analyticsEngine
   */
  generate: (data) => {
    if (!data || !data.overview) return analyticsInsights.getEmptyState();

    const recommendations = [];
    const insights = [];
    
    // 1. ATS Performance Insights
    if (data.ats.scans > 0) {
      if (data.overview.avgAtsScore < 60) {
        recommendations.push({
          type: "critical",
          text: "Optimize for ATS compliance",
          desc: `Your average score of ${data.overview.avgAtsScore}% is below the professional threshold. Focus on including more industry-specific keywords.`,
          action: "Open ATS Analyzer"
        });
      } else if (data.overview.avgAtsScore >= 80) {
        insights.push({
          label: "ATS Mastery",
          value: "High Compliance",
          color: "text-emerald-400"
        });
      }
    } else {
      recommendations.push({
        type: "onboarding",
        text: "Analyze your first CV",
        desc: "You haven't performed any ATS scans yet. Knowing your score is the first step to professional success.",
        action: "Run ATS Scan"
      });
    }

    // 2. Visibility & Reach Insights
    if (data.overview.totalCvs > 0) {
      if (data.cvs.publicCount === 0) {
        recommendations.push({
          type: "visibility",
          text: "Increase profile reach",
          desc: "None of your CVs are currently public. Enabling public visibility can help recruiters find you via search.",
          action: "Manage My CVs"
        });
      } else if (data.overview.totalViews > 0 && data.overview.totalDownloads === 0) {
        recommendations.push({
          type: "conversion",
          text: "Improve download conversion",
          desc: "Recruiters are viewing your profile but not downloading. Try refining your 'Professional Summary' to be more concise.",
          action: "Edit Top CV"
        });
      }
    }

    // 3. AI Usage & Efficiency
    if (data.ai.totalGenerations > 0) {
      if (data.ai.coverLettersCount > 0) {
        insights.push({
          label: "AI Efficiency",
          value: `${data.ai.coverLettersCount} Custom Letters`,
          color: "text-indigo-400"
        });
      }
    } else {
      recommendations.push({
        type: "ai",
        text: "Leverage AI writing tools",
        desc: "Save up to 4 hours per week by using our AI tools to draft your professional experience and cover letters.",
        action: "Explore AI Tools"
      });
    }

    // 4. Skill Insights
    if (data.skills.top.length > 0) {
      const topSkill = data.skills.top[0].name;
      insights.push({
        label: "Dominant Skill",
        value: topSkill,
        color: "text-blue-400"
      });
    }

    // 5. Calculate Health Score
    const healthScore = analyticsInsights.calculateHealthScore(data);

    return {
      healthScore,
      recommendations: recommendations.slice(0, 3), // Top 3
      insights: insights.slice(0, 4), // Top 4
      summary: analyticsInsights.generateNarrativeSummary(data)
    };
  },

  calculateHealthScore: (data) => {
    let score = 40; // Base baseline for any account

    // CV completeness and volume
    if (data.overview.totalCvs > 0) score += 10;
    if (data.cvs.publicCount > 0) score += 10;
    
    // ATS Optimization
    if (data.ats.scans > 0) {
      score += (data.overview.avgAtsScore / 100) * 15;
    }
    
    // Tool Engagement
    if (data.ai.totalGenerations > 5) score += 10;
    if (data.ai.jobMatchesCount > 0) score += 5;
    if (data.interview.sessions > 0) score += 5;
    
    // Performance Metrics
    if (data.overview.totalViews > 0) score += 5;
    
    return Math.min(Math.round(score), 100);
  },

  generateNarrativeSummary: (data) => {
    if (data.overview.totalCvs === 0) return "Start building your professional profile to see AI-powered insights here.";
    
    const strength = data.overview.avgAtsScore > 75 ? "well-optimized for ATS" : "ready for optimization";
    const reach = data.overview.totalViews > 10 ? "moderate visibility" : "emerging visibility";
    
    return `Your profile shows ${reach} and is ${strength}. You have successfully generated ${data.ai.totalGenerations} AI assets to support your career growth.`;
  },

  getEmptyState: () => ({
    healthScore: 0,
    recommendations: [
      {
        type: "onboarding",
        text: "Build your first CV",
        desc: "Get started by creating a professional CV to unlock detailed analytics and AI insights.",
        action: "Go to Builder"
      }
    ],
    insights: [],
    summary: "Welcome to ProCV Lite. Start your journey by creating a professional CV."
  })
};
