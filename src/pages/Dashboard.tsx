import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { RiskOverview } from '@/components/dashboard/RiskOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { Users, Heart, TrendingUp, Video, Activity, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, type DashboardActivityItem, type DashboardRiskItem } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    injuryAlerts: 0,
    portfolioValue: '€0.0M',
    videosAnalyzed: 0,
    predictionsMade: 0,
    subtitle: '',
  });
  const [riskOverview, setRiskOverview] = useState<DashboardRiskItem[]>([]);
  const [performancePoints, setPerformancePoints] = useState<Array<{ month: string; predictions: number; accuracy: number }>>([]);
  const [recentActivities, setRecentActivities] = useState<DashboardActivityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const [riskRes, trendRes, activityRes] = await Promise.all([
        apiService.getDashboardRiskOverview(5),
        apiService.getDashboardPerformanceTrends(6),
        apiService.getDashboardRecentActivity(8),
      ]);
      if (riskRes.data) setRiskOverview(riskRes.data.players);
      if (trendRes.data) setPerformancePoints(trendRes.data.points);
      if (activityRes.data) setRecentActivities(activityRes.data.activities);

      if (isAdmin) {
        const response = await apiService.getAdminDashboard();
        if (response.data) {
          setStats({
            totalPlayers: response.data.totalPlayers,
            injuryAlerts: response.data.injuryAlerts,
            portfolioValue: response.data.totalPortfolioValue,
            videosAnalyzed: response.data.totalMatches,
            predictionsMade: response.data.totalMatches,
            subtitle: `Across ${response.data.totalClubs} clubs`,
          });
        }
      } else {
        const response = await apiService.getAnalystDashboard();
        if (response.data) {
          setStats({
            totalPlayers: response.data.totalPlayers,
            injuryAlerts: response.data.injuryAlerts,
            portfolioValue: response.data.marketValue,
            videosAnalyzed: response.data.videosAnalyzed,
            predictionsMade: response.data.totalMatches,
            subtitle: `${response.data.totalMatches} finalized matches`,
          });
        }
      }
    };
    load();
  }, [isAdmin]);

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="AI-powered football analytics overview"
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Players"
            value={stats.totalPlayers}
            subtitle={stats.subtitle || 'From database'}
            icon={Users}
          />
          <StatCard
            title="Injury Alerts"
            value={stats.injuryAlerts}
            subtitle="High risk players"
            icon={Heart}
            variant="danger"
          />
          <StatCard
            title="Value Predictions"
            value={stats.portfolioValue}
            subtitle="Estimated portfolio"
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Videos Analyzed"
            value={stats.videosAnalyzed}
            subtitle="From match history"
            icon={Video}
            variant="primary"
          />
        </div>

        {/* Prediction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <StatCard
            title="Predictions Made"
            value={stats.predictionsMade}
            subtitle="Based on stored matches"
            icon={Activity}
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart data={performancePoints} />
          </div>
          <div>
            <RiskOverview players={riskOverview} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={recentActivities} />
          
          {/* Quick Actions */}
          <div className="stat-card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/injury')} className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-left group">
                <Heart className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Run Injury Scan</p>
                <p className="text-xs text-muted-foreground">Analyze all players</p>
              </button>
              <button onClick={() => navigate('/market-value')} className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left group">
                <TrendingUp className="w-6 h-6 text-risk-low mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Update Values</p>
                <p className="text-xs text-muted-foreground">Recalculate market</p>
              </button>
              <button onClick={() => navigate('/video')} className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left group">
                <Video className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Upload Video</p>
                <p className="text-xs text-muted-foreground">Analyze footage</p>
              </button>
              <button onClick={() => navigate('/players')} className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left group">
                <Brain className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Open Players</p>
                <p className="text-xs text-muted-foreground">Manage roster</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
