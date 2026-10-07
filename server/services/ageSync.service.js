import { Player } from '../models/Player.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const syncPlayerAges = async () => {
  try {
    const result = await Player.updateMany(
      { birthDate: { $ne: null } },
      [
        {
          $set: {
            age: {
              $dateDiff: {
                startDate: '$birthDate',
                endDate: '$$NOW',
                unit: 'year',
              },
            },
          },
        },
      ]
    );
    if (result.modifiedCount > 0) {
      console.log(`[ageSync] Updated age for ${result.modifiedCount} player(s)`);
    }
  } catch (error) {
    console.error('[ageSync] Failed to sync player ages:', error.message);
  }
};

export const startAgeSyncJob = () => {
  syncPlayerAges();
  setInterval(syncPlayerAges, MS_PER_DAY);
};
