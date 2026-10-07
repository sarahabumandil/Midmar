import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Video, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [totals, setTotals] = useState({
    totalUsers: 0,
    totalPlayers: 0,
    totalVideos: 0,
    avgMarketValue: 0,
  });
  const [usageTrends, setUsageTrends] = useState<Array<{ month: string; users: number; videos: number; players: number }>>([]);
  const [injuryDistribution, setInjuryDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [teamPerformance, setTeamPerformance] = useState<Array<{ name: string; players: number; injuries: number; videos: number; marketValue: number }>>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [showOnlyActiveTeams, setShowOnlyActiveTeams] = useState(false);

  useEffect(() => {
    const load = async () => {
      const months = timeRange === 'week' ? 3 : timeRange === 'year' ? 12 : 6;
      const response = await apiService.getAdminAnalytics(months);
      if (!response.data) return;
      setTotals(response.data.totals);
      setUsageTrends(response.data.usageTrends);
      setInjuryDistribution(response.data.injuryDistribution);
      setTeamPerformance(response.data.teamPerformance);
    };
    load();
  }, [timeRange]);

  const visibleTeamPerformance = teamPerformance
    .filter((t) => !showOnlyActiveTeams || t.videos > 0)
    .slice(0, 10);

  const handleExportReport = () => {
    const rows = [
      ['Team', 'Players', 'Injuries', 'Videos', 'MarketValueM'],
      ...teamPerformance.map((t) => [t.name, String(t.players), String(t.injuries), String(t.videos), String(t.marketValue)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export complete', description: 'Analytics CSV downloaded.' });
  };

  const handleToggleFilters = () => {
    setShowOnlyActiveTeams((prev) => !prev);
    toast({
      title: 'Filter updated',
      description: !showOnlyActiveTeams ? 'Showing only teams with analyzed videos.' : 'Showing all teams.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Analytics" 
        subtitle="System-wide analytics and performance insights"
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleToggleFilters}>
              <Filter className="w-4 h-4 mr-2" />
              {showOnlyActiveTeams ? 'Active Teams Only' : 'More Filters'}
            </Button>
          </div>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={totals.totalUsers}
            subtitle="Active accounts"
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Total Players"
            value={totals.totalPlayers}
            subtitle="Across all teams"
            icon={Users}
          />
          <StatCard
            title="Videos Analyzed"
            value={totals.totalVideos}
            subtitle={`${timeRange} period`}
            icon={Video}
            variant="success"
          />
          <StatCard
            title="Avg Market Value"
            value={`€${totals.avgMarketValue.toFixed(1)}M`}
            subtitle="Per team"
            icon={TrendingUp}
            variant="primary"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Trends */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Usage Trends</h3>
                <p className="text-sm text-muted-foreground">Growth over time</p>
              </div>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
                <Line type="monotone" dataKey="videos" stroke="#10b981" strokeWidth={2} name="Videos" />
                <Line type="monotone" dataKey="players" stroke="#f59e0b" strokeWidth={2} name="Players" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Injury Distribution */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Injury Risk Distribution</h3>
                <p className="text-sm text-muted-foreground">Players by latest risk level</p>
              </div>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={injuryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {injuryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance Comparison */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Top Teams by Market Value</h3>
              <p className="text-sm text-muted-foreground">Performance comparison</p>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={visibleTeamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="marketValue" fill="#3b82f6" name="Market Value (€M)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Stats Table */}
        <div className="stat-card">
          <h3 className="font-semibold text-lg mb-4">Team Performance Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Team</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Players</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Injuries</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Videos</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Market Value</th>
                </tr>
              </thead>
              <tbody>
                {visibleTeamPerformance.map((team, index) => (
                  <tr key={index} className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium">{team.name}</td>
                    <td className="py-3 px-4 text-right">{team.players}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={team.injuries > 2 ? 'text-destructive' : team.injuries > 0 ? 'text-warning' : 'text-foreground'}>
                        {team.injuries}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{team.videos}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary">€{team.marketValue}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
