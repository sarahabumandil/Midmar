import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { buildAnalysisVideoUrl, analysisVideoNeedsCrossOrigin } from '@/lib/analysisVideo';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { apiService, type PlayerInsight } from '@/services/api';
import { Upload, Play, Video, BarChart3, Database, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

const TABLE_HEADERS = [
  'PID',
  'Team',
  'DB player',
  'Dist(m)',
  'MaxSpd',
  'HSR(m)',
  'Spr',
  'Risk',
  'T',
  'I',
  'B',
  'G',
  'A',
] as const;

type RosterPlayer = { id: string; globalId: number; name: string };

export default function VideoAnalysis() {
  const [playerInsights, setPlayerInsights] = useState<PlayerInsight[] | null>(null);
  const [matchScore, setMatchScore] = useState<Record<string, number> | null>(null);
  const [outputVideoFilename, setOutputVideoFilename] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [mappingByPid, setMappingByPid] = useState<Record<number, string>>({});
  const [matchTitle, setMatchTitle] = useState('Video analysis');
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<'all' | 'team-a' | 'team-b'>('all');

  const loadRoster = useCallback(async () => {
    const res = await apiService.getMyPlayers();
    if (res.data?.players?.length) {
      const list: RosterPlayer[] = res.data.players
        .map((p: { id: string; globalId: number; name: string }) => ({
          id: p.id,
          globalId: p.globalId,
          name: p.name,
        }))
        .sort((a, b) => a.globalId - b.globalId);
      setRoster(list);
    } else {
      setRoster([]);
    }
  }, []);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setPlayerInsights(null);
    setMatchScore(null);
    setOutputVideoFilename(null);
    setMappingByPid({});
    setError(null);
    setCommitMessage(null);
    setCommitError(null);
    setTeamFilter('all');
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    setPlayerInsights(null);
    setMatchScore(null);
    setOutputVideoFilename(null);
    setMappingByPid({});
    setCommitMessage(null);
    setCommitError(null);
    setTeamFilter('all');
    try {
      const result = await apiService.analyzeVideo(selectedFile);
      if (result.error) {
        setError(result.error);
        return;
      }
      const insights = result.data?.playerInsights ?? [];
      setPlayerInsights(insights);
      if (result.data?.matchScore) {
        setMatchScore(result.data.matchScore);
      }
      setOutputVideoFilename(result.data?.outputVideoFilename ?? null);
      const init: Record<number, string> = {};
      for (const p of insights) {
        init[p.pid] = '_none';
      }
      setMappingByPid(init);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analysisVideoUrl =
    outputVideoFilename && /^analysis_[a-fA-F0-9]+\.mp4$/.test(outputVideoFilename)
      ? buildAnalysisVideoUrl(outputVideoFilename)
      : null;

  const [videoLoadError, setVideoLoadError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  useEffect(() => {
    setVideoLoadError(null);
    setDownloadError(null);
  }, [outputVideoFilename]);

  const downloadAnnotatedVideo = async () => {
    if (!outputVideoFilename || !analysisVideoUrl) return;
    setDownloadError(null);
    setDownloadBusy(true);
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(analysisVideoUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = outputVideoFilename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setDownloadError('Download failed. Check that the API is running and the file exists on the server.');
    } finally {
      setDownloadBusy(false);
    }
  };

  const filteredInsights = useMemo(() => {
    if (!playerInsights?.length) return [];
    if (teamFilter === 'all') return playerInsights;
    if (teamFilter === 'team-a') return playerInsights.filter((p) => p.team === 'Team A');
    return playerInsights.filter((p) => p.team === 'Team B');
  }, [playerInsights, teamFilter]);

  const chartData = useMemo(
    () =>
      filteredInsights.map((p) => ({
        name: `#${p.pid}`,
        pid: p.pid,
        team: p.team,
        'Dist(m)': Number(p.dist_m.toFixed(1)),
        'MaxSpd': Number(p.max_spd.toFixed(1)),
        'HSR(m)': Number(p.hsr_m.toFixed(1)),
        Spr: p.spr,
        Risk: Number(p.risk.toFixed(1)),
        T: p.tackles ?? 0,
        I: p.interceptions ?? 0,
        B: p.blocks ?? 0,
        G: p.g,
        A: p.a,
      })),
    [filteredInsights]
  );

  const commitStats = async () => {
    if (!playerInsights?.length) return;
    setCommitError(null);
    setCommitMessage(null);

    const mappings = playerInsights.flatMap((p) => {
      const v = mappingByPid[p.pid];
      if (!v || v === '_none') return [];
      return [{ tempTrackingId: p.pid, globalId: Number(v) }];
    });

    if (mappings.length === 0) {
      setCommitError('Choose at least one database player (global ID) for a tracked PID.');
      return;
    }

    const gids = mappings.map((m) => m.globalId);
    if (new Set(gids).size !== gids.length) {
      setCommitError('Each database player can only be assigned to one CV player ID.');
      return;
    }

    setCommitLoading(true);
    try {
      const res = await apiService.commitVideoAnalysis({
        title: matchTitle.trim() || 'Video analysis',
        matchDate,
        rawInsights: playerInsights,
        mappings,
        analysisOutputFilename: outputVideoFilename,
      });
      if (res.error) {
        setCommitError(res.error);
        return;
      }
      setCommitMessage(
        res.data?.message
          ? `${res.data.message} (${res.data.upsertedStats ?? 0} player rows).`
          : 'Stats saved.'
      );
    } catch (e) {
      setCommitError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setCommitLoading(false);
    }
  };

  const teamColor = (team: string) => (team === 'Team A' ? 'hsl(var(--primary))' : 'hsl(142, 76%, 36%)');

  return (
    <div className="min-h-screen">
      <Header
        title="Video Analysis"
        subtitle="Upload a match video — computer vision model analyzes players and outputs insights by ID"
      />

      <div className="p-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload */}
          <div className="space-y-4">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">Upload match video</h3>
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                  selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : 'Click or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI</p>
              </div>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={!selectedFile || isAnalyzing}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Analyze video
            </Button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedFile && !playerInsights && !isAnalyzing && (
              <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
                <Video className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Upload a match video</h3>
                <p className="text-muted-foreground max-w-md">
                  Use the computer vision model to get per-player insights: distance, max speed, HSR, sprints, risk, defensive counts (tackles, interceptions, blocks), goals and assists by player ID.
                </p>
              </div>
            )}

            {error && (
              <div className="stat-card border-destructive/50 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">Ensure the backend and Python API are running (npm run dev:all).</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="stat-card py-16">
                <div className="max-w-md mx-auto space-y-6">
                  <LoadingSpinner size="lg" text="Analyzing video..." />
                  <div className="text-center text-xs text-muted-foreground space-y-1">
                    <p>Running detection and tracking...</p>
                    <p>Computing distance, speed, HSR, sprints, risk and defensive stats...</p>
                  </div>
                </div>
              </div>
            )}

            {playerInsights !== null && !isAnalyzing && (
              <>
                <div className="stat-card border-2 border-primary/30 ai-border-glow">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Video className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Analysis complete</h3>
                      <p className="text-sm text-muted-foreground">
                        {playerInsights.length > 0
                          ? `${playerInsights.length} players — insights by ID`
                          : 'No players detected — check match score below'}
                      </p>
                    </div>
                  </div>
                </div>

                {analysisVideoUrl && (
                  <div className="stat-card">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h3 className="font-semibold">Annotated output video</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={downloadBusy}
                          onClick={downloadAnnotatedVideo}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {downloadBusy ? 'Preparing…' : 'Download MP4'}
                        </Button>
                        <a
                          href={analysisVideoUrl}
                          download={outputVideoFilename ?? 'annotated-output.mp4'}
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          Open / save link
                        </a>
                      </div>
                    </div>
                    <video
                      key={outputVideoFilename ?? 'v'}
                      className="w-full max-h-[420px] rounded-lg border border-border bg-black"
                      controls
                      playsInline
                      preload="metadata"
                      src={analysisVideoUrl}
                      crossOrigin={
                        analysisVideoNeedsCrossOrigin(analysisVideoUrl) ? 'anonymous' : undefined
                      }
                      onError={() =>
                        setVideoLoadError(
                          'Unable to play this video. Ensure the Node server is running, the file exists under server/python-api/output_videos/, and if the app uses VITE_API_URL it points to your API (e.g. http://localhost:3000/api).'
                        )
                      }
                      onLoadedData={() => setVideoLoadError(null)}
                    />
                    {videoLoadError && (
                      <p className="text-sm text-destructive mt-2">{videoLoadError}</p>
                    )}
                    {downloadError && (
                      <p className="text-sm text-destructive mt-2">{downloadError}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Detection overlay from the CV pipeline. If playback fails, use Download MP4. File:{' '}
                      {outputVideoFilename}
                    </p>
                  </div>
                )}

                {/* Match score — always show both teams */}
                {matchScore && (
                  <div className="stat-card bg-muted/30">
                    <h3 className="font-semibold mb-3">Match score</h3>
                    <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                      <span className="text-foreground">Team A</span>
                      <span className="text-primary">{matchScore['Team A'] ?? 0}</span>
                      <span className="text-muted-foreground mx-1">–</span>
                      <span className="text-primary">{matchScore['Team B'] ?? 0}</span>
                      <span className="text-foreground">Team B</span>
                    </div>
                  </div>
                )}

                {playerInsights.length > 0 && (
                  <div className="stat-card space-y-4">
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <h3 className="font-semibold">Map to database players</h3>
                        <p className="text-sm text-muted-foreground">
                          Assign each CV player ID (PID) to a club player using their global ID (jersey number in your roster). Then save to create a match record and attach stats to those players.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="match-title">Match title</Label>
                        <Input
                          id="match-title"
                          value={matchTitle}
                          onChange={(e) => setMatchTitle(e.target.value)}
                          placeholder="e.g. Training match"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="match-date">Match date</Label>
                        <Input
                          id="match-date"
                          type="date"
                          value={matchDate}
                          onChange={(e) => setMatchDate(e.target.value)}
                        />
                      </div>
                    </div>
                    {roster.length === 0 && (
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        No players in your club roster. Add players under Players before saving stats.
                      </p>
                    )}
                    {commitError && (
                      <p className="text-sm text-destructive">{commitError}</p>
                    )}
                    {commitMessage && (
                      <p className="text-sm text-green-700 dark:text-green-400">{commitMessage}</p>
                    )}
                    <Button
                      onClick={commitStats}
                      disabled={commitLoading || roster.length === 0 || playerInsights.length === 0}
                      className="w-full sm:w-auto"
                    >
                      {commitLoading ? 'Saving…' : 'Save stats to database'}
                    </Button>
                  </div>
                )}

                {/* Player insights table */}
                {playerInsights.length > 0 && (
                  <div className="stat-card">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Player insights</h3>
                        {teamFilter !== 'all' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Showing {teamFilter === 'team-a' ? 'Team A' : 'Team B'} only (
                            {filteredInsights.length} of {playerInsights.length} players)
                          </p>
                        )}
                      </div>
                      <ToggleGroup
                        type="single"
                        value={teamFilter}
                        onValueChange={(v) =>
                          v && setTeamFilter(v as 'all' | 'team-a' | 'team-b')
                        }
                        variant="outline"
                        size="sm"
                        className="justify-start flex-wrap"
                      >
                        <ToggleGroupItem value="all" aria-label="All teams">
                          All
                        </ToggleGroupItem>
                        <ToggleGroupItem value="team-a" aria-label="Team A only">
                          Team A
                        </ToggleGroupItem>
                        <ToggleGroupItem value="team-b" aria-label="Team B only">
                          Team B
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    {filteredInsights.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">
                        No players for this team in the analysis. Switch filters or run analysis again.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-border rounded-lg overflow-hidden min-w-[720px]">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              {TABLE_HEADERS.map((h) => (
                                <th
                                  key={h}
                                  className={cn(
                                    'py-3 px-2 font-medium text-muted-foreground',
                                    h === 'PID' || h === 'Team' || h === 'DB player'
                                      ? 'text-left'
                                      : 'text-right'
                                  )}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredInsights.map((p) => (
                              <tr key={p.pid} className="border-b border-border/50 hover:bg-secondary/50">
                                <td className="py-3 px-2 font-medium">{p.pid}</td>
                                <td className="py-3 px-2">{p.team}</td>
                                <td className="py-2 px-2 align-middle min-w-[200px]">
                                  <Select
                                    value={mappingByPid[p.pid] ?? '_none'}
                                    onValueChange={(v) =>
                                      setMappingByPid((prev) => ({ ...prev, [p.pid]: v }))
                                    }
                                  >
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder="Assign player" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="_none">— Not assigned —</SelectItem>
                                      {roster.map((pl) => (
                                        <SelectItem key={pl.id} value={String(pl.globalId)}>
                                          #{pl.globalId} {pl.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="py-3 px-2 text-right font-mono">{p.dist_m.toFixed(1)}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.max_spd.toFixed(1)}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.hsr_m.toFixed(1)}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.spr}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.risk.toFixed(1)}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.tackles ?? 0}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.interceptions ?? 0}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.blocks ?? 0}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.g}</td>
                                <td className="py-3 px-2 text-right font-mono">{p.a}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Visualizations (same team filter as table) */}
                {playerInsights.length > 0 && filteredInsights.length > 0 && (
                  <div className="stat-card">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Visualizations
                      {teamFilter !== 'all' && (
                        <span className="text-xs font-normal text-muted-foreground">
                          ({teamFilter === 'team-a' ? 'Team A' : 'Team B'})
                        </span>
                      )}
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Distance (m) by player</p>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="Dist(m)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Max speed & HSR (m) by player</p>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="MaxSpd" name="Max speed" fill="hsl(190, 95%, 45%)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="HSR(m)" name="HSR (m)" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Sprints & Risk by player</p>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Spr" name="Sprints" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry, i) => (
                                <Cell key={i} fill={teamColor(entry.team)} />
                              ))}
                            </Bar>
                            <Bar dataKey="Risk" name="Risk" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Goals & Assists by player</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="G" name="Goals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="A" name="Assists" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Defensive events (T / I / B) by player</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="T" name="Tackles" fill="hsl(220, 70%, 45%)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="I" name="Interceptions" fill="hsl(280, 55%, 50%)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="B" name="Blocks" fill="hsl(35, 90%, 45%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
