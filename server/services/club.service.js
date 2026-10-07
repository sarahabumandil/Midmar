import { Club } from '../models/Team.js';

export const ensureClubByName = async (clubName, createdBy = null) => {
  const trimmed = String(clubName || '').trim();
  if (!trimmed) {
    throw new Error('Club name is required');
  }

  const club = await Club.findOneAndUpdate(
    { name: trimmed },
    {
      $setOnInsert: {
        createdBy,
        totalPlayers: 0,
        totalMatches: 0,
        injuryAlerts: 0,
        marketValueTotal: 0,
        videosAnalyzed: 0,
      },
    },
    { upsert: true, new: true }
  );

  return club;
};
