import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { PlayerCard } from '@/components/ui/player-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PlayerData } from '@/services/mockAIService';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, Flag, Activity, Ruler, Weight, Plus, Pencil, Trash2, Upload, Link as LinkIcon, AlertTriangle, RefreshCw, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { PlayerAvatar } from '@/components/ui/player-avatar';

export default function Players() {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') ?? '';
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    shirtNumber: '',
    name: '',
    birthDate: '',
    position: '',
    team: '',
    nationality: '',
    matches: '',
    goals: '',
    assists: '',
    tackles: '',
    interceptions: '',
    minutesPlayed: '',
    injuries: '',
    saves: '',
    cleanSheets: '',
    savePerMatch: '',
    goalsConceded: '',
    penaltiesSaved: '',
    distanceCoveredKm: '',
    maxSpeedKmh: '',
    sprintCount: '',
    hsrM: '',
    height: '',
    weight: '',
    sprintSpeed: '',
    stamina: '',
    strength: '',
    imageUrl: '',
  });

  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [inactivityThreshold, setInactivityThreshold] = useState(5);
  const [thresholdInput, setThresholdInput] = useState('5');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetLogs, setResetLogs] = useState<Array<{
    id: string;
    resetAt: string;
    resetByName: string;
    consecutiveMissedMatchesAtReset: number;
  }>>([]);

  const isGoalkeeperForm = formData.position.toLowerCase() === 'goalkeeper';
  const isPlayerInactive = (p: typeof selectedPlayer) =>
    !!p && (p.consecutiveMissedMatches ?? 0) >= inactivityThreshold;

  // Load players for the current user's team from the backend
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!user) {
        setPlayers([]);
        return;
      }

      try {
        const response = await apiService.getMyPlayers();
        if (response.error || !response.data) {
          console.error('Error fetching players:', response.error);
          setPlayers([]);
          return;
        }
        setPlayers(response.data.players as PlayerData[]);
        const t = response.data.inactivityThreshold ?? 5;
        setInactivityThreshold(t);
        setThresholdInput(String(t));
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      }
    };

    fetchPlayers();
  }, [user]);

  // Auto-fill team name when dialog opens, reset form when it closes
  useEffect(() => {
    if (isDialogOpen && user?.teamInfo?.name) {
      const defaultTeam = user.teamInfo.name;
      setFormData(prev => ({
        ...prev,
        team: prev.team || defaultTeam,
      }));
    } else if (!isDialogOpen) {
      setFormData({
        shirtNumber: '',
        name: '',
        birthDate: '',
        position: '',
        team: '',
        nationality: '',
        matches: '',
        goals: '',
        assists: '',
        tackles: '',
        interceptions: '',
        minutesPlayed: '',
        injuries: '',
        saves: '',
        cleanSheets: '',
        savePerMatch: '',
        goalsConceded: '',
        penaltiesSaved: '',
        distanceCoveredKm: '',
        maxSpeedKmh: '',
        sprintCount: '',
        hsrM: '',
        height: '',
        weight: '',
        sprintSpeed: '',
        stamina: '',
        strength: '',
        imageUrl: '',
      });
    }
  }, [isDialogOpen, user]);

  useEffect(() => {
    if (!selectedPlayer) { setResetLogs([]); return; }
    apiService.getResetLogs(selectedPlayer.id).then((res) => {
      if (!res.error && res.data) setResetLogs(res.data.logs);
      else setResetLogs([]);
    });
  }, [selectedPlayer?.id]);

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((prev) => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSavePlayer = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add players',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.birthDate || !formData.position || !formData.team || !formData.nationality || !formData.shirtNumber) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (T-shirt no, Name, Date of Birth, Position, Team, Nationality)',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        birthDate: formData.birthDate || undefined,
        position: formData.position,
        nationality: formData.nationality,
        globalId: parseInt(formData.shirtNumber) || 0,
        shirtNumber: parseInt(formData.shirtNumber) || 0,
        stats: {
          matches: parseInt(formData.matches) || 0,
          goals: parseInt(formData.goals) || 0,
          assists: parseInt(formData.assists) || 0,
          tackles: parseInt(formData.tackles) || 0,
          interceptions: parseInt(formData.interceptions) || 0,
          minutesPlayed: parseInt(formData.minutesPlayed) || 0,
          injuries: parseInt(formData.injuries) || 0,
          saves: parseInt(formData.saves) || 0,
          cleanSheets: parseInt(formData.cleanSheets) || 0,
          savePerMatch: parseFloat(formData.savePerMatch) || 0,
          goalsConceded: parseInt(formData.goalsConceded) || 0,
          penaltiesSaved: parseInt(formData.penaltiesSaved) || 0,
          distanceCoveredKm: parseFloat(formData.distanceCoveredKm) || 0,
          maxSpeedKmh: parseFloat(formData.maxSpeedKmh) || 0,
          sprintCount: parseInt(formData.sprintCount) || 0,
          hsrM: parseInt(formData.hsrM) || 0,
        },
        physical: {
          height: parseInt(formData.height) || 0,
          weight: parseInt(formData.weight) || 0,
          sprintSpeed: parseInt(formData.sprintSpeed) || 0,
          stamina: parseInt(formData.stamina) || 0,
          strength: parseInt(formData.strength) || 0,
        },
        imageUrl: formData.imageUrl.trim(),
      };

      const response = editingPlayerId
        ? await apiService.updatePlayer(editingPlayerId, payload)
        : await apiService.createPlayer(payload);

      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to create player');
      }

      const newPlayer = response.data.player as PlayerData;

      toast({
        title: editingPlayerId ? 'Player updated' : 'Player added',
        description: `${newPlayer.name} has been successfully ${editingPlayerId ? 'updated' : 'added'} to your team.`,
      });

      // Reset form
      setFormData({
        shirtNumber: '',
        name: '',
        birthDate: '',
        position: '',
        team: '',
        nationality: '',
        matches: '',
        goals: '',
        assists: '',
        tackles: '',
        interceptions: '',
        minutesPlayed: '',
        injuries: '',
        saves: '',
        cleanSheets: '',
        savePerMatch: '',
        goalsConceded: '',
        penaltiesSaved: '',
        distanceCoveredKm: '',
        maxSpeedKmh: '',
        sprintCount: '',
        hsrM: '',
        height: '',
        weight: '',
        sprintSpeed: '',
        stamina: '',
        strength: '',
        imageUrl: '',
      });

      setEditingPlayerId(null);
      setIsDialogOpen(false);
      setPlayers(prev => {
        const idx = prev.findIndex(p => p.id === newPlayer.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = newPlayer;
          return copy;
        }
        return [...prev, newPlayer];
      });
      setSelectedPlayer(newPlayer);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add player',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = () => {
    if (!selectedPlayer) return;
    setEditingPlayerId(selectedPlayer.id);
    setFormData({
      shirtNumber: String(selectedPlayer.shirtNumber ?? selectedPlayer.globalId ?? ''),
      name: selectedPlayer.name || '',
      birthDate: selectedPlayer.birthDate || '',
      position: selectedPlayer.position || '',
      team: selectedPlayer.team || '',
      nationality: selectedPlayer.nationality || '',
      matches: String(selectedPlayer.stats.matches || 0),
      goals: String(selectedPlayer.stats.goals || 0),
      assists: String(selectedPlayer.stats.assists || 0),
      tackles: String(selectedPlayer.stats.tackles || 0),
      interceptions: String(selectedPlayer.stats.interceptions || 0),
      minutesPlayed: String(selectedPlayer.stats.minutesPlayed || 0),
      injuries: String(selectedPlayer.stats.injuries || 0),
      saves: String(selectedPlayer.stats.saves || 0),
      cleanSheets: String(selectedPlayer.stats.cleanSheets || 0),
      savePerMatch: String(selectedPlayer.stats.savePerMatch || 0),
      goalsConceded: String(selectedPlayer.stats.goalsConceded || 0),
      penaltiesSaved: String(selectedPlayer.stats.penaltiesSaved || 0),
      distanceCoveredKm: String(selectedPlayer.stats.distanceCoveredKm || 0),
      maxSpeedKmh: String(selectedPlayer.stats.maxSpeedKmh || 0),
      sprintCount: String(selectedPlayer.stats.sprintCount || 0),
      hsrM: String(selectedPlayer.stats.hsrM || 0),
      height: String(selectedPlayer.physical.height || 0),
      weight: String(selectedPlayer.physical.weight || 0),
      sprintSpeed: String(selectedPlayer.physical.sprintSpeed || 0),
      stamina: String(selectedPlayer.physical.stamina || 0),
      strength: String(selectedPlayer.physical.strength || 0),
      imageUrl: selectedPlayer.imageUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (!selectedPlayer) return;
    if (!window.confirm(`Delete ${selectedPlayer.name}? This cannot be undone.`)) return;
    const response = await apiService.deletePlayer(selectedPlayer.id);
    if (response.error) {
      toast({ title: 'Error', description: response.error, variant: 'destructive' });
      return;
    }
    setPlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
    setSelectedPlayer(null);
    toast({ title: 'Player deleted', description: `${selectedPlayer.name} was deleted.` });
  };

  const handleResetPredictionData = async () => {
    if (!selectedPlayer) return;
    setIsResetting(true);
    try {
      const response = await apiService.resetPredictionData(selectedPlayer.id);
      if (response.error || !response.data) throw new Error(response.error || 'Reset failed');
      const updated = response.data.player as PlayerData;
      setPlayers(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSelectedPlayer(updated);
      setResetConfirmOpen(false);
      apiService.getResetLogs(updated.id).then(r => {
        if (!r.error && r.data) setResetLogs(r.data.logs);
      });
      toast({ title: 'Prediction data reset', description: `${updated.name}'s injury model data has been cleared.` });
    } catch (error) {
      toast({ title: 'Reset failed', description: error instanceof Error ? error.message : 'Failed to reset', variant: 'destructive' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateThreshold = async () => {
    const t = parseInt(thresholdInput);
    if (isNaN(t) || t < 1 || t > 50) {
      toast({ title: 'Invalid threshold', description: 'Enter a number between 1 and 50', variant: 'destructive' });
      return;
    }
    const response = await apiService.updateInactivityThreshold(t);
    if (response.error) { toast({ title: 'Error', description: response.error, variant: 'destructive' }); return; }
    setInactivityThreshold(t);
    toast({ title: 'Threshold updated', description: `Inactivity threshold set to ${t} consecutive matches.` });
  };

  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => {
      const name = String(p.name || '').toLowerCase();
      const position = String(p.position || '').toLowerCase();
      const team = String(p.team || '').toLowerCase();
      const shirt = String(p.shirtNumber ?? p.globalId ?? '');
      const nationality = String(p.nationality || '').toLowerCase();
      const id = String(p.id || '').toLowerCase();
      return (
        name.includes(q) ||
        position.includes(q) ||
        team.includes(q) ||
        nationality.includes(q) ||
        shirt.includes(q) ||
        id.includes(q)
      );
    });
  }, [players, searchQuery]);

  return (
    <div className="min-h-screen">
      <Header 
        title="Players" 
        subtitle="Player database and profiles"
      />
      
      <div className="p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Team Players</h2>
            <p className="text-muted-foreground">Manage your team's player database</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openEditDialog} disabled={!selectedPlayer} variant="outline">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleDeleteSelected} disabled={!selectedPlayer} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              onClick={() => {
                setEditingPlayerId(null);
                setIsDialogOpen(true);
              }}
              className="group"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Use the search bar in the header to filter players by name, team, position, or shirt number.
        </p>

        {user?.role === 'admin' && (
          <div className="stat-card border-amber-500/30 mb-4 flex items-center gap-4 flex-wrap">
            <Settings className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-amber-300">Inactivity Threshold</h3>
              <p className="text-xs text-muted-foreground">Consecutive missed matches before "Reset Player Data" appears</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="50"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                className="w-20 h-8 text-center"
              />
              <Button size="sm" variant="outline" onClick={handleUpdateThreshold}>Save</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player List */}
          <div className="lg:col-span-2">
            {filteredPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="relative">
                    {isPlayerInactive(player) && (
                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-amber-500/90 text-amber-950 text-[11px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                        <AlertTriangle className="w-3 h-3" />
                        Inactive
                      </div>
                    )}
                    <PlayerCard
                      player={player}
                      isSelected={selectedPlayer?.id === player.id}
                      onClick={() => setSelectedPlayer(player)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="stat-card text-center py-12">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{players.length === 0 ? 'No players yet' : 'No players match your search'}</h3>
                <p className="text-muted-foreground mb-4">
                  {players.length === 0 ? 'Get started by adding your first player' : 'Try a different name, position, or shirt number.'}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
              </div>
            )}
          </div>

          {/* Player Details */}
          <div className="space-y-4">
            {selectedPlayer ? (
              <>
                {/* Profile Card */}
                <div className="stat-card border-primary/30 ai-border-glow">
                  <div className="flex items-center gap-4 mb-6">
                    <PlayerAvatar
                      name={selectedPlayer.name}
                      imageUrl={selectedPlayer.imageUrl}
                      className="w-20 h-20 rounded-xl border-2 border-emerald-500/40"
                      iconClassName="w-10 h-10"
                    />
                    <div>
                      <h2 className="font-bold text-xl">{selectedPlayer.name}</h2>
                      <p className="text-emerald-300 font-medium">{selectedPlayer.position}</p>
                      <p className="text-xs text-muted-foreground">T-shirt #{selectedPlayer.shirtNumber ?? selectedPlayer.globalId ?? '-'}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedPlayer.team}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Flag className="w-4 h-4 text-emerald-300" />
                        <span className="text-xs text-emerald-100/85">Nationality</span>
                      </div>
                      <p className="font-medium text-emerald-300">{selectedPlayer.nationality}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-emerald-300" />
                        <span className="text-xs text-emerald-100/85">Age</span>
                      </div>
                      <p className="font-medium text-emerald-300">{selectedPlayer.age} years</p>
                      {selectedPlayer.birthDate && (
                        <p className="text-xs text-emerald-100/60 mt-0.5">
                          {new Date(selectedPlayer.birthDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {isPlayerInactive(selectedPlayer) && (
                    <div className="mt-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-300">
                          Inactive — {selectedPlayer.consecutiveMissedMatches} consecutive matches missed
                        </p>
                        <p className="text-xs text-amber-100/70 mt-0.5">
                          Injury model data may be stale. Reset to collect fresh data.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20 shrink-0"
                        onClick={() => setResetConfirmOpen(true)}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Reset Data
                      </Button>
                    </div>
                  )}
                </div>

                {/* Performance Stats */}
                <div className="stat-card border-emerald-500/30 bg-emerald-500/[0.04]">
                  <h3 className="font-semibold mb-4">Performance Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {((selectedPlayer.position || '').toLowerCase() === 'goalkeeper'
                      ? [
                          { label: 'Matches', value: selectedPlayer.stats.matches },
                          { label: 'Minutes', value: selectedPlayer.stats.minutesPlayed },
                          { label: 'Saves', value: selectedPlayer.stats.saves ?? 0 },
                          { label: 'Clean Sheets', value: selectedPlayer.stats.cleanSheets ?? 0 },
                          { label: 'Save/Match', value: selectedPlayer.stats.savePerMatch ?? 0 },
                          { label: 'Goals Conceded', value: selectedPlayer.stats.goalsConceded ?? 0 },
                          { label: 'Penalties Saved', value: selectedPlayer.stats.penaltiesSaved ?? 0 },
                          { label: 'Distance (km)', value: selectedPlayer.stats.distanceCoveredKm ?? 0 },
                          { label: 'Max Speed (km/h)', value: selectedPlayer.stats.maxSpeedKmh ?? 0 },
                          { label: 'Sprint Count', value: selectedPlayer.stats.sprintCount ?? 0 },
                          { label: 'HSR (m)', value: selectedPlayer.stats.hsrM ?? 0 },
                        ]
                      : [
                          { label: 'Matches', value: selectedPlayer.stats.matches },
                          { label: 'Goals', value: selectedPlayer.stats.goals },
                          { label: 'Assists', value: selectedPlayer.stats.assists },
                          { label: 'Minutes', value: selectedPlayer.stats.minutesPlayed },
                          { label: 'Tackles', value: selectedPlayer.stats.tackles ?? 0 },
                          { label: 'Interceptions', value: selectedPlayer.stats.interceptions ?? 0 },
                          { label: 'Distance (km)', value: selectedPlayer.stats.distanceCoveredKm ?? 0 },
                          { label: 'Max Speed (km/h)', value: selectedPlayer.stats.maxSpeedKmh ?? 0 },
                          { label: 'Sprint Count', value: selectedPlayer.stats.sprintCount ?? 0 },
                          { label: 'HSR (m)', value: selectedPlayer.stats.hsrM ?? 0 },
                        ]).map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-emerald-100/80">{stat.label}</p>
                        <p className="font-mono text-xl font-bold text-emerald-300">{stat.value}</p>
                      </div>
                    ))}
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-emerald-100/80">Injuries</p>
                      <p className={cn(
                        "font-mono text-xl font-bold",
                        selectedPlayer.stats.injuries > 2 && "text-risk-high",
                        selectedPlayer.stats.injuries > 0 && selectedPlayer.stats.injuries <= 2 && "text-risk-medium",
                        selectedPlayer.stats.injuries === 0 && "text-emerald-300"
                      )}>
                        {selectedPlayer.stats.injuries}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Physical Attributes */}
                <div className="stat-card border-emerald-500/30 bg-emerald-500/[0.03]">
                  <h3 className="font-semibold mb-4">Physical Attributes</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Ruler className="w-4 h-4 text-emerald-300" />
                          <span className="text-xs text-emerald-100/85">Height</span>
                        </div>
                        <p className="font-medium text-emerald-300">{selectedPlayer.physical.height} cm</p>
                      </div>
                      <div className="p-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Weight className="w-4 h-4 text-emerald-300" />
                          <span className="text-xs text-emerald-100/85">Weight</span>
                        </div>
                        <p className="font-medium text-emerald-300">{selectedPlayer.physical.weight} kg</p>
                      </div>
                    </div>

                    {/* Attribute Bars */}
                    {[
                      { label: 'Sprint Speed', value: selectedPlayer.physical.sprintSpeed },
                      { label: 'Stamina', value: selectedPlayer.physical.stamina },
                      { label: 'Strength', value: selectedPlayer.physical.strength },
                    ].map((attr) => (
                      <div key={attr.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-emerald-100/85">{attr.label}</span>
                          <span className="text-sm font-mono text-emerald-300">{attr.value}</span>
                        </div>
                        <div className="w-full h-2 bg-emerald-900/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${attr.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset History */}
                {resetLogs.length > 0 && (
                  <div className="stat-card border-amber-500/20 bg-amber-500/[0.02]">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-amber-400" />
                      <h3 className="font-semibold text-sm">Prediction Data Reset History</h3>
                    </div>
                    <div className="space-y-2">
                      {resetLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                          <div>
                            <p className="text-amber-200 font-medium">{new Date(log.resetAt).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">by {log.resetByName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-amber-300/70">{log.consecutiveMissedMatchesAtReset} missed at reset</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
                <User className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Select a Player</h3>
                <p className="text-muted-foreground">
                  Click on a player card to view their detailed profile.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Player Dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingPlayerId(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlayerId ? 'Edit Player' : 'Add New Player'}</DialogTitle>
              <DialogDescription>
                Enter player information to add them to your team database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="shirtNumber">T-shirt Number (Global ID) *</Label>
                  <Input
                    id="shirtNumber"
                    type="number"
                    placeholder="15"
                    value={formData.shirtNumber}
                    onChange={(e) => setFormData({ ...formData, shirtNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Marcus Sterling"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Date of Birth *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="Defender">Defender</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                      <SelectItem value="Forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team">Team *</Label>
                  <Input
                    id="team"
                    placeholder="Manchester United"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  placeholder="England"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  required
                />
              </div>
              <div className="border-t border-border pt-4 mt-2">
                <h4 className="font-semibold mb-3">Player Photo (optional)</h4>
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={imageInputMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageInputMode('url')}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={imageInputMode === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageInputMode('upload')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {imageInputMode === 'url' ? (
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/player.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="imageUpload">Upload from PC</Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
                {formData.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <h4 className="font-semibold mb-4">Performance Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="matches">Matches</Label>
                    <Input
                      id="matches"
                      type="number"
                      placeholder="34"
                      value={formData.matches}
                      onChange={(e) => setFormData({ ...formData, matches: e.target.value })}
                    />
                  </div>
                  {!isGoalkeeperForm && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="goals">Goals</Label>
                        <Input
                          id="goals"
                          type="number"
                          placeholder="22"
                          value={formData.goals}
                          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="assists">Assists</Label>
                        <Input
                          id="assists"
                          type="number"
                          placeholder="8"
                          value={formData.assists}
                          onChange={(e) => setFormData({ ...formData, assists: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="minutesPlayed">Minutes Played</Label>
                    <Input
                      id="minutesPlayed"
                      type="number"
                      placeholder="2890"
                      value={formData.minutesPlayed}
                      onChange={(e) => setFormData({ ...formData, minutesPlayed: e.target.value })}
                    />
                  </div>
                  {isGoalkeeperForm ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="saves">Saves</Label>
                        <Input
                          id="saves"
                          type="number"
                          placeholder="60"
                          value={formData.saves}
                          onChange={(e) => setFormData({ ...formData, saves: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cleanSheets">Clean Sheets</Label>
                        <Input
                          id="cleanSheets"
                          type="number"
                          placeholder="20"
                          value={formData.cleanSheets}
                          onChange={(e) => setFormData({ ...formData, cleanSheets: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="savePerMatch">Save per Match</Label>
                        <Input
                          id="savePerMatch"
                          type="number"
                          step="0.01"
                          placeholder="5"
                          value={formData.savePerMatch}
                          onChange={(e) => setFormData({ ...formData, savePerMatch: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goalsConceded">Goals Conceded</Label>
                        <Input
                          id="goalsConceded"
                          type="number"
                          placeholder="32"
                          value={formData.goalsConceded}
                          onChange={(e) => setFormData({ ...formData, goalsConceded: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="penaltiesSaved">Penalties Saved</Label>
                        <Input
                          id="penaltiesSaved"
                          type="number"
                          placeholder="7"
                          value={formData.penaltiesSaved}
                          onChange={(e) => setFormData({ ...formData, penaltiesSaved: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="tackles">Tackles</Label>
                        <Input
                          id="tackles"
                          type="number"
                          placeholder="68"
                          value={formData.tackles}
                          onChange={(e) => setFormData({ ...formData, tackles: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="interceptions">Interceptions</Label>
                        <Input
                          id="interceptions"
                          type="number"
                          placeholder="54"
                          value={formData.interceptions}
                          onChange={(e) => setFormData({ ...formData, interceptions: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="injuries">Injuries</Label>
                    <Input
                      id="injuries"
                      type="number"
                      placeholder="1"
                      value={formData.injuries}
                      onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="distanceCoveredKm">Distance Covered (km)</Label>
                    <Input
                      id="distanceCoveredKm"
                      type="number"
                      step="0.1"
                      placeholder="130"
                      value={formData.distanceCoveredKm}
                      onChange={(e) => setFormData({ ...formData, distanceCoveredKm: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxSpeedKmh">Max Speed (km/h)</Label>
                    <Input
                      id="maxSpeedKmh"
                      type="number"
                      step="0.1"
                      placeholder="35.5"
                      value={formData.maxSpeedKmh}
                      onChange={(e) => setFormData({ ...formData, maxSpeedKmh: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sprintCount">Sprint Count</Label>
                    <Input
                      id="sprintCount"
                      type="number"
                      placeholder="310"
                      value={formData.sprintCount}
                      onChange={(e) => setFormData({ ...formData, sprintCount: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hsrM">HSR (m)</Label>
                    <Input
                      id="hsrM"
                      type="number"
                      placeholder="8500"
                      value={formData.hsrM}
                      onChange={(e) => setFormData({ ...formData, hsrM: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <h4 className="font-semibold mb-4">Physical Attributes</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="182"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="78"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sprintSpeed">Sprint Speed (0-100)</Label>
                    <Input
                      id="sprintSpeed"
                      type="number"
                      placeholder="94"
                      min="0"
                      max="100"
                      value={formData.sprintSpeed}
                      onChange={(e) => setFormData({ ...formData, sprintSpeed: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stamina">Stamina (0-100)</Label>
                    <Input
                      id="stamina"
                      type="number"
                      placeholder="88"
                      min="0"
                      max="100"
                      value={formData.stamina}
                      onChange={(e) => setFormData({ ...formData, stamina: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="strength">Strength (0-100)</Label>
                    <Input
                      id="strength"
                      type="number"
                      placeholder="76"
                      min="0"
                      max="100"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlayer}>
                {editingPlayerId ? 'Save Changes' : 'Add Player'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Prediction Data Confirmation */}
        <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                Reset Player Prediction Data
              </DialogTitle>
              <DialogDescription>
                This will permanently clear all injury model data for <strong>{selectedPlayer?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-3 text-sm">
              <p className="text-muted-foreground font-medium">The following will be cleared:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
                <li>Workload metrics (distance, sprints, HSR, max speed)</li>
                <li>Match participation count &amp; minutes played</li>
                <li>Injury history count</li>
                <li>Rolling aggregate prediction windows</li>
                <li>All per-match prediction records</li>
              </ul>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-emerald-300 text-xs font-medium">
                  Profile info, goals, assists, tackles, and physical attributes will NOT be affected.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetConfirmOpen(false)} disabled={isResetting}>
                Cancel
              </Button>
              <Button
                onClick={handleResetPredictionData}
                disabled={isResetting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isResetting ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Resetting...</>
                ) : (
                  <><RefreshCw className="w-4 h-4 mr-2" />Confirm Reset</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
