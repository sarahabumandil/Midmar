import { PlayerData } from './mockAIService';

// Store players per user (in production, this would be a database)
// Structure: { userEmail: PlayerData[] }
let playersByUser: Record<string, PlayerData[]> = {};

// Load players from localStorage on initialization
const loadPlayers = () => {
  try {
    const stored = localStorage.getItem('playersByUser');
    if (stored) {
      playersByUser = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading players from localStorage:', error);
    localStorage.removeItem('playersByUser');
  }
};

// Save players to localStorage
const savePlayers = () => {
  try {
    localStorage.setItem('playersByUser', JSON.stringify(playersByUser));
  } catch (error) {
    console.error('Error saving players to localStorage:', error);
  }
};

// Initialize on module load
loadPlayers();

// Generate unique player ID
const generatePlayerId = (userEmail: string): string => {
  const userPlayers = playersByUser[userEmail] || [];
  const maxId = userPlayers.reduce((max, p) => {
    const numId = parseInt(p.id.replace('p', '')) || 0;
    return Math.max(max, numId);
  }, 0);
  return `p${maxId + 1}`;
};

export const getPlayersByUser = (userEmail: string): PlayerData[] => {
  return playersByUser[userEmail] || [];
};

export const addPlayer = (userEmail: string, player: Omit<PlayerData, 'id'>): PlayerData => {
  if (!playersByUser[userEmail]) {
    playersByUser[userEmail] = [];
  }
  
  const newPlayer: PlayerData = {
    id: generatePlayerId(userEmail),
    ...player,
  };
  
  playersByUser[userEmail].push(newPlayer);
  savePlayers();
  return newPlayer;
};

export const updatePlayer = (userEmail: string, playerId: string, updates: Partial<PlayerData>): PlayerData => {
  const userPlayers = playersByUser[userEmail];
  if (!userPlayers) {
    throw new Error('User has no players');
  }
  
  const playerIndex = userPlayers.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  playersByUser[userEmail][playerIndex] = {
    ...playersByUser[userEmail][playerIndex],
    ...updates,
    id: playerId, // Keep original ID
  };
  
  savePlayers();
  return playersByUser[userEmail][playerIndex];
};

export const deletePlayer = (userEmail: string, playerId: string): void => {
  const userPlayers = playersByUser[userEmail];
  if (!userPlayers) {
    throw new Error('User has no players');
  }
  
  const playerIndex = userPlayers.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  playersByUser[userEmail].splice(playerIndex, 1);
  savePlayers();
};

export const getPlayerById = (userEmail: string, playerId: string): PlayerData | undefined => {
  const userPlayers = playersByUser[userEmail] || [];
  return userPlayers.find(p => p.id === playerId);
};
