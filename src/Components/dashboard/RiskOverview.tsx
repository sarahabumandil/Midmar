import { RiskBadge } from '@/components/ui/risk-badge';
import type { DashboardRiskItem } from '@/services/api';

interface RiskOverviewProps {
  players: DashboardRiskItem[];
}

export function RiskOverview({ players }: RiskOverviewProps) {
  return (
    <div className="stat-card">
      <h3 className="font-semibold mb-4">Injury Risk Overview</h3>
      <div className="space-y-3">
        {players.length === 0 && (
          <p className="text-sm text-muted-foreground">No risk data available yet.</p>
        )}
        {players.map((player) => (
          <div 
            key={player.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{player.name}</p>
              <p className="text-xs text-muted-foreground">{player.position} • {player.team}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-medium">{(player.riskProbability * 100).toFixed(1)}%</span>
              <RiskBadge level={player.riskLevel} showLabel={false} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
