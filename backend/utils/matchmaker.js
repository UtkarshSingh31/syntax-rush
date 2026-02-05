/**
 * Matchmaker Utility
 * Ports the logic from ML/src/services/base_matcher.py to Node.js
 */

const K = 32; // Elo sensitivity factor

class Matchmaker {
  constructor() {
    this.queue = []; // Array of { socketId, user, matchType, joinedAt, currentTolerance }
  }

  /**
   * Adds a player to the queue
   * @param {string} socketId 
   * @param {Object} user 
   * @param {string} matchType 
   */
  addPlayer(socketId, user, matchType) {
    // Remove if already exists
    this.removePlayer(user._id);

    this.queue.push({
      socketId,
      user,
      matchType,
      joinedAt: Date.now(),
      currentTolerance: 100, // Initial rating difference allowed
      rating: user.performanceStats?.battlePoints || 1200 // Default rating if none
    });
    console.log(`Added ${user.username} to matchmaking queue. Type: ${matchType}`);
  }

  /**
   * Removes a player from the queue
   * @param {string} userId 
   */
  removePlayer(userId) {
    const initialLen = this.queue.length;
    this.queue = this.queue.filter(p => String(p.user._id) !== String(userId));
    if (this.queue.length < initialLen) {
      console.log(`Removed user ${userId} from queue.`);
    }
  }

  /**
   * Finds a match for a specific player or tries to pair all available players
   * @returns {Array|null} [playerA, playerB] or null
   */
  findMatch(basePlayerId) {
    const basePlayer = this.queue.find(p => String(p.user._id) === String(basePlayerId));
    if (!basePlayer) return null;

    // Filter potential opponents
    const candidates = this.queue.filter(p =>
      p.socketId !== basePlayer.socketId &&
      p.matchType === basePlayer.matchType &&
      Math.abs(p.rating - basePlayer.rating) <= basePlayer.currentTolerance
    );

    if (candidates.length > 0) {
      // Sort candidates by rating proximity or join time
      candidates.sort((a, b) => Math.abs(a.rating - basePlayer.rating) - Math.abs(b.rating - basePlayer.rating));

      const opponent = candidates[0];

      // Remove both from queue
      this.removePlayer(basePlayer.user._id);
      this.removePlayer(opponent.user._id);

      return [basePlayer, opponent];
    }

    return null;
  }

  /**
   * Periodically called to expand tolerance for waiting players
   */
  expandTolerances(step = 50, maxExpand = 600) {
    this.queue.forEach(p => {
      if (p.currentTolerance < maxExpand) {
        p.currentTolerance += step;
      }
    });
  }

  /**
   * Calculates Elo rating update
   * @param {number} ra Rating of player A
   * @param {number} rb Rating of player B
   * @param {number} result Result for player A (1 for win, 0 for loss, 0.5 for draw)
   */
  static calculateEloUpdate(ra, rb, result) {
    const pa = 1 / (1 + Math.pow(10, (rb - ra) / 400));
    const newRating = Math.round(ra + K * (result - pa));
    return newRating;
  }

  /**
   * Map XP to League based on ML/src/services/leagues/league_config.py
   */
  static getLeague(xp) {
    if (xp >= 2100) return "Master";
    if (xp >= 1500) return "Diamond";
    if (xp >= 1000) return "Platinum";
    if (xp >= 600) return "Gold";
    if (xp >= 300) return "Silver";
    if (xp >= 120) return "Bronze";
    return "Standard";
  }
}

const matchmaker = new Matchmaker();
export default matchmaker;
