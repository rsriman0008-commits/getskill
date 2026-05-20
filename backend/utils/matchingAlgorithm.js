/**
 * Calculate match score between two users based on:
 * - Complementary skills (A wants to learn what B teaches and vice versa)
 * - Skill category alignment
 * - Exact skill name matches
 */
function calculateMatch(userA, userB) {
  if (!userA || !userB) return { score: 0, type: 'No Match' };

  let score = 0;

  // Get skills arrays safely
  const userALearn = userA.skillsLearn || [];
  const userATeach = userA.skillsTeach || [];
  const userBLearn = userB.skillsLearn || [];
  const userBTeach = userB.skillsTeach || [];

  // Check if A wants to learn what B teaches
  for (const skillA of userALearn) {
    for (const skillB of userBTeach) {
      // Exact title match (bonus)
      if (skillA.title.toLowerCase() === skillB.title.toLowerCase()) {
        score += 50;
      }
      // Category match
      else if (skillA.category === skillB.category) {
        score += 30;
      }
    }
  }

  // Check if B wants to learn what A teaches
  for (const skillA of userATeach) {
    for (const skillB of userBLearn) {
      // Exact title match (bonus)
      if (skillA.title.toLowerCase() === skillB.title.toLowerCase()) {
        score += 50;
      }
      // Category match
      else if (skillA.category === skillB.category) {
        score += 30;
      }
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine match type
  let type = 'No Match';
  if (score >= 80) {
    type = 'Perfect Match';
  } else if (score >= 40) {
    type = 'Good Match';
  } else if (score > 0) {
    type = 'Partial Match';
  }

  return { score, type };
}

/**
 * Get all matches for a user, sorted by match score
 */
async function findMatches(targetUser, allUsers, limit = 10) {
  const matches = [];

  for (const user of allUsers) {
    // Don't match user with themselves
    if (user._id.toString() === targetUser._id.toString()) continue;

    const match = calculateMatch(targetUser, user);

    if (match.score > 0) {
      matches.push({
        user: {
          _id: user._id,
          name: user.name,
          bio: user.bio,
          location: user.location,
          skillsTeach: user.skillsTeach,
          skillsLearn: user.skillsLearn,
          trustScore: user.trustScore
        },
        matchScore: match.score,
        matchType: match.type
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Return top N matches
  return matches.slice(0, limit);
}

module.exports = {
  calculateMatch,
  findMatches
};
