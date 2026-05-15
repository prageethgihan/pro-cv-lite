/**
 * Analytics Recommendation Actions
 * Handles the logic for automated workflows triggered by insights
 */

export const analyticsRecommendationActions = {
  /**
   * Identifies the best CV for an automated task
   * @param {Array} cvs - List of CV objects
   * @returns {Object|null} The best CV to use
   */
  findBestCv: (cvs) => {
    if (!cvs || cvs.length === 0) return null;

    // 1. Try to find the most recently updated CV
    const sortedByDate = [...cvs].sort((a, b) => {
      const timeA = a.updatedAt?.seconds || new Date(a.updatedAt).getTime() || 0;
      const timeB = b.updatedAt?.seconds || new Date(b.updatedAt).getTime() || 0;
      return timeB - timeA;
    });

    // 2. Alternatively, could look for highest ATS score if that's the goal
    // For "Run ATS Scan", usually we want the most recent one or the one with a low score that needs fixing.
    
    return sortedByDate[0];
  },

  /**
   * Prepares the navigation state for an automated ATS Scan
   * @param {Object} analytics - The full analytics object
   * @returns {Object} Navigation state
   */
  prepareAtsScan: (analytics) => {
    const bestCv = analyticsRecommendationActions.findBestCv(analytics.cvs.list);
    
    if (!bestCv) {
      return {
        error: "No CV found to analyze. Please create a CV first."
      };
    }

    return {
      autoScan: true,
      cvId: bestCv.id,
      cvTitle: bestCv.title || "Untitled CV",
      source: "insights_recommendation"
    };
  }
};
