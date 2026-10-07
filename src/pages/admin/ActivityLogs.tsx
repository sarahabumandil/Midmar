import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  User,
  Calendar,
  Activity as ActivityIcon,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  ipAddress: string;
  details?: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  const [resources, setResources] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await apiService.getAdminActivityLogs({ page: 1, limit: 200 });
      if (!response.data) return;
      setLogs(response.data.logs);
      setFilteredLogs(response.data.logs);
      setResources(response.data.resources || []);
    };
    load();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        log =>
          log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Resource filter
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(log => log.resource === resourceFilter);
    }

    setFilteredLogs(filtered);
  }, [searchQuery, statusFilter, resourceFilter, logs]);

  const getStatusIcon = (status: ActivityLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-risk-low" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-risk-medium" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: ActivityLog['status']) => {
    switch (status) {
      case 'success':
        return 'bg-risk-low/10 text-risk-low border-risk-low/20';
      case 'warning':
        return 'bg-risk-medium/10 text-risk-medium border-risk-medium/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const uniqueResources = resources.length > 0 ? resources : Array.from(new Set(logs.map(log => log.resource)));

  const handleExport = () => {
    const rows = [
      ['Timestamp', 'User', 'Email', 'Action', 'Resource', 'Status', 'IP', 'Details'],
      ...filteredLogs.map((l) => [
        l.timestamp,
        l.user,
        l.userEmail,
        l.action,
        l.resource,
        l.status,
        l.ipAddress,
        l.details || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export complete', description: `Exported ${filteredLogs.length} log records.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Activity Logs" 
        subtitle="User activity tracking and audit logs"
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, action, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              {uniqueResources.map(resource => (
                <SelectItem key={resource} value={resource}>{resource}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success</p>
                <p className="text-2xl font-bold text-risk-low">
                  {filteredLogs.filter(l => l.status === 'success').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-risk-low" />
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-risk-medium">
                  {filteredLogs.filter(l => l.status === 'warning').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-risk-medium" />
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-destructive">
                  {filteredLogs.filter(l => l.status === 'error').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="stat-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Resource</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{log.user}</p>
                            <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ActivityIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{log.action}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{log.resource}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                          getStatusColor(log.status)
                        )}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-muted-foreground">{log.ipAddress}</span>
                      </td>
                      <td className="py-3 px-4">
                        {log.details ? (
                          <span className="text-sm text-muted-foreground">{log.details}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
