/**
 * Storage service for Cover Letters
 */

const STORAGE_KEYS = {
  RECENT_LETTERS: "procv_recent_letters",
  STATS: "procv_cover_letter_stats"
};

export const coverLetterStorage = {
  // Get all recent letters
  getRecentLetters: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT_LETTERS);
      const letters = saved ? JSON.parse(saved) : [];
      // Data migration/hardening: Ensure all letters have unique IDs
      return letters.map((l, idx) => ({
        ...l,
        id: l.id || `legacy-${idx}-${Date.now()}`
      }));
    } catch (e) {
      console.error("Failed to load recent letters", e);
      return [];
    }
  },

  // Save a new letter
  saveLetter: (letter) => {
    try {
      const letters = coverLetterStorage.getRecentLetters();
      const newLetter = {
        ...letter,
        id: letter.id || Date.now().toString(),
        timestamp: letter.timestamp || new Date().toISOString(),
      };
      
      const updated = [newLetter, ...letters].slice(0, 20); // Keep last 20
      localStorage.setItem(STORAGE_KEYS.RECENT_LETTERS, JSON.stringify(updated));
      
      // Update global stats
      coverLetterStorage.updateStats(newLetter);
      
      return updated;
    } catch (e) {
      console.error("Failed to save letter", e);
      return [];
    }
  },

  // Update stats based on a new letter
  updateStats: (newLetter) => {
    try {
      const stats = coverLetterStorage.getStats();
      stats.totalGenerated += 1;
      
      // Update templates used
      if (newLetter.template && !stats.templatesUsed.includes(newLetter.template)) {
        stats.templatesUsed.push(newLetter.template);
      }
      
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error("Failed to update stats", e);
    }
  },

  // Get global stats
  getStats: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      return saved ? JSON.parse(saved) : {
        totalGenerated: 0,
        templatesUsed: [],
        totalTimeSaved: 0 // In minutes
      };
    } catch (e) {
      return { totalGenerated: 0, templatesUsed: [], totalTimeSaved: 0 };
    }
  },


  // Update an existing letter
  updateLetter: (id, updates) => {
    try {
      const letters = coverLetterStorage.getRecentLetters();
      const updated = letters.map(l => 
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      );
      localStorage.setItem(STORAGE_KEYS.RECENT_LETTERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  // Duplicate an existing letter
  duplicateLetter: (id) => {
    try {
      const letters = coverLetterStorage.getRecentLetters();
      const letterToCopy = letters.find(l => l.id === id);
      if (!letterToCopy) return letters;

      const newLetter = {
        ...letterToCopy,
        id: Date.now().toString(),
        title: `${letterToCopy.title} (Copy)`,
        timestamp: new Date().toISOString(),
        isFavorite: false
      };
      
      const updated = [newLetter, ...letters].slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.RECENT_LETTERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  // Delete a letter
  deleteLetter: (id) => {
    try {
      const letters = coverLetterStorage.getRecentLetters();
      const updated = letters.filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEYS.RECENT_LETTERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  // Toggle favorite
  toggleFavorite: (id) => {
    try {
      const letters = coverLetterStorage.getRecentLetters();
      const updated = letters.map(l => 
        l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
      );
      localStorage.setItem(STORAGE_KEYS.RECENT_LETTERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  }
};
