import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { RiskBadge } from '@/components/ui/risk-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type PlayerData, type InjuryPredictionResponse } from '@/services/mockAIService';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, CheckCircle, Info, Play, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
// Physical attributes used for injury prediction (not goals/assists like market value)
const defaultPhysical = {
  age: 25,
  height: 180,
  weight: 75,
  minutes_played: 980,
  distance_covered_km: 130,
  max_speed_kmh: 35.5,
  sprint_count: 310,
  hsr_m: 8500,
};

type InjuryInputs = typeof defaultPhysical;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const buildPlayerInjuryInputs = (player: PlayerData): InjuryInputs => {
  // Use database values for all injury-model inputs.
  return {
    age: clamp(player.age ?? defaultPhysical.age, 16, 45),
    height: clamp(player.physical?.height ?? defaultPhysical.height, 150, 220),
    weight: clamp(player.physical?.weight ?? defaultPhysical.weight, 50, 120),
    minutes_played: clamp(player.stats?.minutesPlayed ?? defaultPhysical.minutes_played, 0, 1500),
    distance_covered_km: clamp(player.stats?.distanceCoveredKm ?? defaultPhysical.distance_covered_km, 0, 250),
    max_speed_kmh: clamp(player.stats?.maxSpeedKmh ?? defaultPhysical.max_speed_kmh, 0, 50),
    sprint_count: clamp(player.stats?.sprintCount ?? defaultPhysical.sprint_count, 0, 800),
    hsr_m: clamp(player.stats?.hsrM ?? defaultPhysical.hsr_m, 0, 20000),
  };
};

export default function InjuryPrediction() {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [prediction, setPrediction] = useState<InjuryPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const { user } = useAuth();

  // Injury model inputs (BMI is computed in backend from height/weight)
  const [age, setAge] = useState(defaultPhysical.age);
  const [height, setHeight] = useState(defaultPhysical.height);
  const [weight, setWeight] = useState(defaultPhysical.weight);
  const [minutesPlayed, setMinutesPlayed] = useState(defaultPhysical.minutes_played);
  const [distanceCoveredKm, setDistanceCoveredKm] = useState(defaultPhysical.distance_covered_km);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(defaultPhysical.max_speed_kmh);
  const [sprintCount, setSprintCount] = useState(defaultPhysical.sprint_count);
  const [hsrM, setHsrM] = useState(defaultPhysical.hsr_m);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bmi = height && weight ? (weight / Math.pow(height / 100, 2)).toFixed(1) : '—';

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!user) {
        setPlayers([]);
        return;
      }
      try {
        const response = await apiService.getMyPlayers();
        if (response.error || !response.data) {
          setPlayers([]);
          return;
        }
        setPlayers(response.data.players as PlayerData[]);
      } catch {
        setPlayers([]);
      }
    };
    fetchPlayers();
  }, [user]);

  useEffect(() => {
    if (!selectedPlayer) return;
    const injuryInputs = buildPlayerInjuryInputs(selectedPlayer);
    setAge(injuryInputs.age);
    setHeight(injuryInputs.height);
    setWeight(injuryInputs.weight);
    setMinutesPlayed(injuryInputs.minutes_played);
    setDistanceCoveredKm(injuryInputs.distance_covered_km);
    setMaxSpeedKmh(injuryInputs.max_speed_kmh);
    setSprintCount(injuryInputs.sprint_count);
    setHsrM(injuryInputs.hsr_m);
  }, [selectedPlayer]);

  const runPrediction = async () => {
    setIsLoading(true);
    setPrediction(null);
    setErrorMessage(null);
    try {
      const response = await apiService.predictInjury({
        playerId: selectedPlayer?.id,
        physical: {
          age,
          height,
          weight,
          minutes_played: minutesPlayed,
          distance_covered_km: distanceCoveredKm,
          max_speed_kmh: maxSpeedKmh,
          sprint_count: sprintCount,
          hsr_m: hsrM,
        },
      });
      if (response.error) {
        setErrorMessage(response.error);
        return;
      }
      if (response.data) setPrediction(response.data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Injury Prediction"
        subtitle="AI injury risk from BMI, minutes, distance, speed, sprints, and HSR"
      />

      <div className="p-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player selection (required for saved prediction linkage) */}
          <div className="space-y-4">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">Select Player (required)</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Required so prediction history links to a real player for dashboard overview.
              </p>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                {players.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No players in your team. Enter values manually below.</p>
                ) : (
                  players.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setSelectedPlayer(player)}
                      className={cn(
                        'w-full text-left rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        selectedPlayer?.id === player.id
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-card text-foreground hover:border-primary/40',
                      )}
                    >
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        T-shirt #{player.shirtNumber ?? player.globalId ?? '-'}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Physical attributes for injury prediction */}
            <div className="stat-card">
              <h3 className="font-semibold mb-4">Injury Model Inputs</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Inputs: BMI (computed from height/weight), Minutes, Distance, Max Speed, Sprint Count, HSR.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Age</label>
                  <Input
                    type="number"
                    min={16}
                    max={45}
                    value={age}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setAge(value);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Height (cm)</label>
                  <Input
                    type="number"
                    min={150}
                    max={220}
                    value={height}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setHeight(value);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Weight (kg)</label>
                  <Input
                    type="number"
                    min={50}
                    max={120}
                    value={weight}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setWeight(value);
                    }}
                    className="mt-1"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  BMI: <span className="font-mono text-foreground">{bmi}</span> (computed)
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Minutes Played</label>
                  <Input
                    type="number"
                    min={0}
                    max={1500}
                    value={minutesPlayed}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setMinutesPlayed(value);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Distance Covered (km)</label>
                  <Input
                    type="number"
                    min={0}
                    max={250}
                    step={0.1}
                    value={distanceCoveredKm}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setDistanceCoveredKm(value);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Max Speed (km/h)</label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    step={0.1}
                    value={maxSpeedKmh}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setMaxSpeedKmh(value);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Sprint Count</label>
                  <Input
                    type="number"
                    min={0}
                    max={800}
                    value={sprintCount}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setSprintCount(value);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">HSR (m)</label>
                  <Input
                    type="number"
                    min={0}
                    max={20000}
                    value={hsrM}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setHsrM(value);
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            <Button
              onClick={runPrediction}
              disabled={isLoading || !selectedPlayer}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Injury Prediction
            </Button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedPlayer && !prediction && (
              <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
                <Info className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Select a Player</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a player from the list and run the AI prediction model to assess their injury risk.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="stat-card flex flex-col items-center justify-center py-16">
                <LoadingSpinner size="lg" text="Running AI models..." />
                <p className="text-xs text-muted-foreground mt-4">
                  Analyzing with Random Forest, XGBoost, and Logistic Regression
                </p>
              </div>
            )}

            {prediction && !isLoading && (
              <>
                {/* Risk Score */}
                <div className={cn(
                  "stat-card border-2",
                  prediction.riskLevel === 'low' && "border-risk-low/30",
                  prediction.riskLevel === 'medium' && "border-risk-medium/30",
                  prediction.riskLevel === 'high' && "border-risk-high/30",
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-lg">Injury Risk Assessment</h3>
                      <p className="text-sm text-muted-foreground">
                        Model confidence: {(prediction.modelConfidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <RiskBadge level={prediction.riskLevel} size="lg" />
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-secondary"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${prediction.riskProbability * 352} 352`}
                          strokeLinecap="round"
                          className={cn(
                            prediction.riskLevel === 'low' && "text-risk-low",
                            prediction.riskLevel === 'medium' && "text-risk-medium",
                            prediction.riskLevel === 'high' && "text-risk-high",
                          )}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">
                          {(prediction.riskProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Risk Interpretation</h4>
                      <p className="text-sm text-muted-foreground">
                        {prediction.riskLevel === 'high' && 
                          "High probability of injury within the next 4-6 weeks. Immediate intervention recommended."}
                        {prediction.riskLevel === 'medium' && 
                          "Moderate injury risk detected. Consider adjusting training load and monitoring closely."}
                        {prediction.riskLevel === 'low' && 
                          "Low injury risk. Player is in good condition to maintain current training regimen."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="stat-card">
                  <h3 className="font-semibold mb-4">Top Risk Factors</h3>
                  <div className="space-y-3">
                    {prediction.topRiskFactors.map((factor, index) => (
                      <div key={index} className="p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{factor.factor}</span>
                          <span className="text-sm font-mono text-primary">
                            {(factor.impact * 100).toFixed(1)}% impact
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${factor.impact * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="stat-card">
                  <h3 className="font-semibold mb-4">AI Recommendations</h3>
                  <div className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        {prediction.riskLevel === 'high' ? (
                          <AlertTriangle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
