import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { 
  type PlayerData,
  type MarketValueResponse
} from '@/services/mockAIService';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, Minus, Play, RefreshCw, Info, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from '@/hooks/use-toast';

export default function MarketValue() {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [prediction, setPrediction] = useState<MarketValueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const { user } = useAuth();

  // Load players for the current user's team from MongoDB
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
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      }
    };

    fetchPlayers();
  }, [user]);

  const runPrediction = async () => {
    if (!selectedPlayer) return;
    
    setIsLoading(true);
    setPrediction(null);
    
    try {
      const result = await apiService.predictMarketValue(selectedPlayer);
      
      if (result.error || !result.data) {
        throw new Error(result.error || 'Prediction failed');
      }
      
      setPrediction(result.data);
    } catch (error) {
      console.error('Prediction failed:', error);
      // Show error toast
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: 'Prediction Error',
        description: error instanceof Error ? error.message : 'Failed to predict market value. Make sure the Python API is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (value: number) => {
    if (value > 0 && value < 0.1) return `EGP ${value.toFixed(3)}M`;
    if (value >= 100) return `EGP ${value.toFixed(0)}M`;
    return `EGP ${value.toFixed(1)}M`;
  };

  const factorChartData = prediction?.valueFactors.map(f => ({
    name: f.factor,
    contribution: f.contribution,
  })) || [];

  return (
    <div className="min-h-screen">
      <Header 
        title="Market Value Prediction" 
        subtitle="AI-powered player valuation using performance metrics"
      />
      
      <div className="p-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Selection */}
          <div className="space-y-4">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">Select Player</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {players.map((player) => (
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
                ))}
              </div>
            </div>

            <Button 
              onClick={runPrediction} 
              disabled={!selectedPlayer || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Calculate Value
            </Button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedPlayer && !prediction && (
              <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
                <Info className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Select a Player</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a player from the list to calculate their predicted market value using our AI model.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="stat-card flex flex-col items-center justify-center py-16">
                <LoadingSpinner size="lg" text="Calculating market value..." />
                <p className="text-xs text-muted-foreground mt-4">
                  Analyzing performance data and market trends
                </p>
              </div>
            )}

            {prediction && !isLoading && (
              <>
                {/* Value Display */}
                <div className="stat-card border-2 border-primary/30 ai-border-glow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-muted-foreground uppercase tracking-wider">Predicted Market Value</h3>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-5xl font-bold gradient-text">
                          {formatValue(prediction.predictedValue)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Range: {formatValue(prediction.valueRange.min)} - {formatValue(prediction.valueRange.max)}
                      </p>
                    </div>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ai-glow">
                      <DollarSign className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Model Confidence: <span className="text-primary font-medium">{(prediction.modelConfidence * 100).toFixed(1)}%</span>
                    </p>
                  </div>
                </div>

                {/* Value Factors Chart */}
                <div className="stat-card">
                  <h3 className="font-semibold mb-4">Value Contribution Factors</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={factorChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                        <XAxis 
                          type="number" 
                          stroke="hsl(215, 20%, 55%)" 
                          fontSize={12}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          stroke="hsl(215, 20%, 55%)" 
                          fontSize={12}
                          width={100}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 9%)',
                            border: '1px solid hsl(222, 47%, 18%)',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Contribution']}
                        />
                        <Bar 
                          dataKey="contribution" 
                          fill="hsl(190, 95%, 50%)" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Factor Details */}
                <div className="stat-card">
                  <h3 className="font-semibold mb-4">Factor Analysis</h3>
                  <div className="space-y-3">
                    {prediction.valueFactors.map((factor, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          {factor.trend === 'up' && <TrendingUp className="w-4 h-4 text-risk-low" />}
                          {factor.trend === 'down' && <TrendingDown className="w-4 h-4 text-risk-high" />}
                          {factor.trend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
                          <span className="font-medium text-sm">{factor.factor}</span>
                        </div>
                        <span className={cn(
                          "text-sm font-mono",
                          factor.trend === 'up' && "text-risk-low",
                          factor.trend === 'down' && "text-risk-high",
                          factor.trend === 'stable' && "text-muted-foreground",
                        )}>
                          {factor.contribution.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input stats used */}
                <div className="stat-card">
                  <h3 className="font-semibold mb-4">Player Stats Used In Prediction</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {Object.entries(prediction.inputStats || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <span className="text-muted-foreground">{key.replaceAll('_', ' ')}</span>
                        <span className="font-mono">{String(value)}</span>
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
