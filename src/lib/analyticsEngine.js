import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getStorageItem } from "./storageHelpers";

/**
 * Analytics Engine
 * Aggregates real data from all application modules
 */

export const analyticsEngine = {
  /**
   * Fetches all analytics data for a specific user
   * @param {Object} user - The auth user object
   */
  getAnalytics: async (user) => {
    if (!user) return analyticsEngine.getEmptyState();

    try {
      // 1. Fetch CV data from Firestore
      const cvsQuery = query(collection(db, "cvs"), where("ownerId", "==", user.uid));
      const cvsSnap = await getDocs(cvsQuery);
      const cvs = cvsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2. Fetch Interview data from Firestore
      const interviewDocRef = doc(db, "interviewData", user.uid);
      const interviewSnap = await getDoc(interviewDocRef);
      const interviewData = interviewSnap.exists() ? interviewSnap.data() : {};

      // 3. Fetch Local Storage Data
      const coverLetters = getStorageItem("procv_recent_letters", []);
      const clStats = getStorageItem("procv_cover_letter_stats", { totalGenerated: 0 });
      const savedJobs = getStorageItem("procv_saved_jobs", []);
      const aiHistory = getStorageItem("procv_ai_history", []);
      const favTemplates = getStorageItem("favorite_templates", []);
      const atsHistory = getStorageItem("procv_ats_history", []);

      // -- Calculations --
      
      // CV Calculations
      const totalCvs = cvs.length;
      const totalViews = cvs.reduce((sum, c) => sum + (c.views || 0), 0);
      const totalDownloads = cvs.reduce((sum, c) => sum + (c.downloads || 0), 0);
      const totalQrScans = cvs.reduce((sum, c) => sum + (c.qrScans || 0), 0);
      const publicCvs = cvs.filter(c => c.isPublished).length;
      const privateCvs = totalCvs - publicCvs;
      
      // ATS Calculations
      const totalAtsScans = atsHistory.length;
      const avgAtsScore = totalAtsScans > 0 
        ? Math.round(atsHistory.reduce((sum, a) => sum + (a.atsScore || 0), 0) / totalAtsScans) 
        : 0;

      // Activity Aggregation
      const activities = [];

      // Add CV activities
      cvs.forEach(c => {
        const ts = c.updatedAt?.seconds 
          ? c.updatedAt.seconds * 1000 
          : c.updatedAt 
            ? new Date(c.updatedAt).getTime() 
            : Date.now();
            
        activities.push({
          id: `cv-upd-${c.id}`,
          type: "CV",
          action: c.isPublished ? "Published" : "Updated",
          target: c.title || "Untitled CV",
          timestamp: ts,
          icon: "file-text"
        });
      });

      // Add Cover Letter activities
      coverLetters.forEach(l => {
        activities.push({
          id: `cl-${l.id}`,
          type: "Cover Letter",
          action: "Generated",
          target: l.title || "Cover Letter",
          timestamp: new Date(l.timestamp || Date.now()).getTime(),
          icon: "file-signature"
        });
      });

      // Add AI Writer activities
      aiHistory.forEach((h, i) => {
        activities.push({
          id: `ai-${i}`,
          type: "AI",
          action: "Generated Content",
          target: h.type || "AI Writing",
          timestamp: new Date(h.timestamp || Date.now()).getTime(),
          icon: "pen-tool"
        });
      });

      // Add ATS activities
      atsHistory.forEach((a, i) => {
        activities.push({
          id: `ats-${i}`,
          type: "ATS",
          action: "Analyzed CV",
          target: `Score: ${a.atsScore}%`,
          timestamp: new Date(a.timestamp || Date.now()).getTime(),
          icon: "file-check"
        });
      });

      // Sort activities by timestamp desc
      activities.sort((a, b) => b.timestamp - a.timestamp);

      // --- Advanced Trend Calculations ---
      const now = Date.now();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now - (29 - i) * 24 * 60 * 60 * 1000);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Bucket activities by date
      const activityTrend = last30Days.map(dateLabel => {
        const count = activities.filter(a => 
          new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateLabel
        ).length;
        return { name: dateLabel, activity: count };
      });

      // Bucket ATS improvement
      const atsTrend = last30Days.map(dateLabel => {
        const dayScans = atsHistory.filter(a => 
          new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateLabel
        );
        const avg = dayScans.length > 0 
          ? dayScans.reduce((s, x) => s + (x.atsScore || 0), 0) / dayScans.length 
          : null; // Use null to allow Recharts to connect dots or handle gaps
        return { name: dateLabel, score: avg };
      });

      // --- Heatmap Data (24h x 7d) ---
      const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));
      activities.forEach(a => {
        const date = new Date(a.timestamp);
        const day = date.getDay();
        const hour = date.getHours();
        heatmap[day][hour]++;
      });

      // --- Skill Extraction ---
      const skillCounts = {};
      // 1. From CVs
      cvs.forEach(c => {
        if (Array.isArray(c.skills)) {
          c.skills.forEach(s => {
            const name = typeof s === 'string' ? s : s.name;
            if (name) skillCounts[name] = (skillCounts[name] || 0) + 2; // CV skills have higher weight
          });
        }
      });
      // 2. From ATS scans (if keywords were found)
      atsHistory.forEach(a => {
        if (Array.isArray(a.keywordMatch?.found)) {
          a.keywordMatch.found.forEach(k => {
            skillCounts[k] = (skillCounts[k] || 0) + 1;
          });
        }
      });
      const topSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      // --- Template Usage ---
      const templateUsage = cvs.reduce((acc, c) => {
        const t = c.templateId || "Template 1";
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {});

      return {
        overview: {
          totalCvs,
          totalViews,
          totalDownloads,
          totalQrScans,
          avgAtsScore,
          interviewRate: interviewData.confidenceLevel || 0,
          profileReach: totalViews + totalQrScans,
          aiUsageCount: aiHistory.length
        },
        cvs: {
          list: cvs,
          publicCount: publicCvs,
          privateCount: privateCvs,
          topPerforming: [...cvs].sort((a, b) => {
            const scoreA = (a.views || 0) * 1 + (a.downloads || 0) * 5 + (a.atsScore || 0) * 0.1;
            const scoreB = (b.views || 0) * 1 + (b.downloads || 0) * 5 + (b.atsScore || 0) * 0.1;
            return scoreB - scoreA;
          }).slice(0, 5)
        },
        ats: {
          scans: totalAtsScans,
          average: avgAtsScore,
          history: atsHistory,
          distribution: analyticsEngine.calculateAtsDistribution(atsHistory),
          trend: atsTrend
        },
        ai: {
          totalGenerations: aiHistory.length,
          coverLettersCount: clStats.totalGenerated || coverLetters.length,
          jobMatchesCount: savedJobs.length,
          history: aiHistory,
          activityTrend: activityTrend
        },
        interview: {
          confidence: interviewData.confidenceLevel || 0,
          mastered: interviewData.questionsMastered || 0,
          sessions: interviewData.mockSessions || 0
        },
        skills: {
          top: topSkills
        },
        templates: {
          favorites: favTemplates.length,
          usage: templateUsage
        },
        heatmap,
        recentActivity: activities.slice(0, 20),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Analytics aggregation error:", error);
      return analyticsEngine.getEmptyState();
    }
  },

  calculateAtsDistribution: (history) => {
    const dist = { Excellent: 0, Good: 0, Average: 0, Poor: 0 };
    if (!history || history.length === 0) return dist;

    history.forEach(a => {
      const s = a.atsScore || 0;
      if (s >= 80) dist.Excellent++;
      else if (s >= 60) dist.Good++;
      else if (s >= 40) dist.Average++;
      else dist.Poor++;
    });

    // Convert to percentages
    const total = history.length;
    return {
      Excellent: Math.round((dist.Excellent / total) * 100),
      Good: Math.round((dist.Good / total) * 100),
      Average: Math.round((dist.Average / total) * 100),
      Poor: Math.round((dist.Poor / total) * 100)
    };
  },

  getEmptyState: () => ({
    overview: {
      totalCvs: 0, totalViews: 0, totalDownloads: 0, totalQrScans: 0,
      avgAtsScore: 0, interviewRate: 0, profileReach: 0, aiUsageCount: 0
    },
    cvs: { list: [], publicCount: 0, privateCount: 0, topPerforming: [] },
    ats: { scans: 0, average: 0, history: [], distribution: { Excellent: 0, Good: 0, Average: 0, Poor: 0 }, trend: [] },
    ai: { totalGenerations: 0, coverLettersCount: 0, jobMatchesCount: 0, history: [], activityTrend: [] },
    interview: { confidence: 0, mastered: 0, sessions: 0 },
    skills: { top: [] },
    templates: { favorites: 0, usage: {} },
    heatmap: Array(7).fill(0).map(() => Array(24).fill(0)),
    recentActivity: [],
    timestamp: Date.now()
  })
};
