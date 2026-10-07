import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download,
  BarChart3,
  Users,
  TrendingUp,
  FileSpreadsheet,
  Mail
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';
type ExportFormat = 'pdf' | 'excel' | 'csv';

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  date: string;
  format: string;
  status: 'queued' | 'sent' | 'failed';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'analytics' | 'users' | 'system' | 'custom';
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: 'Comprehensive user activity and engagement metrics',
    icon: Users,
    category: 'users',
  },
  {
    id: 'team-performance',
    name: 'Team Performance Report',
    description: 'Team analytics, player stats, and performance metrics',
    icon: BarChart3,
    category: 'analytics',
  },
  {
    id: 'system-usage',
    name: 'System Usage Report',
    description: 'Platform usage statistics and resource consumption',
    icon: TrendingUp,
    category: 'system',
  },
  {
    id: 'injury-analysis',
    name: 'Injury Analysis Report',
    description: 'Injury predictions and risk assessment across teams',
    icon: FileText,
    category: 'analytics',
  },
  {
    id: 'market-value',
    name: 'Market Value Report',
    description: 'Player valuations and market trends',
    icon: TrendingUp,
    category: 'analytics',
  },
  {
    id: 'player-squad',
    name: 'Player Squad Report',
    description: 'Player roster, physical profile, and key metrics overview',
    icon: FileSpreadsheet,
    category: 'users',
  },
];

export default function Reports() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);

  useEffect(() => {
    const loadRecentReports = async () => {
      const response = await apiService.getRecentReportRequests();
      if (!response.data) return;
      const mapped = response.data.requests.map((request) => ({
        id: request.id,
        templateId: request.templateId,
        name: reportTemplates.find((t) => t.id === request.templateId)?.name || request.templateId,
        date: request.createdAt,
        format: String(request.format || '').toUpperCase(),
        status: request.status,
      }));
      setRecentReports(mapped);
    };

    loadRecentReports();
  }, []);

  const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const downloadBlob = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDateRangeLabel = () => {
    if (dateRange !== 'custom') return `Last ${dateRange}`;
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    return 'Custom range';
  };

  const addRecentReport = (templateId: string, reportName: string, selectedFormat: ExportFormat) => {
    const next: GeneratedReport = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      templateId,
      name: reportName,
      date: new Date().toISOString(),
      format: selectedFormat.toUpperCase(),
      status: 'sent',
    };
    setRecentReports((prev) => [next, ...prev].slice(0, 10));
  };

  const generateReportRows = async (templateId: string) => {
    const months = dateRange === 'week' ? 3 : dateRange === 'year' ? 12 : dateRange === 'quarter' ? 3 : 6;
    const [analyticsResponse, logsResponse, dashboardResponse] = await Promise.all([
      apiService.getAdminAnalytics(months),
      apiService.getAdminActivityLogs({ page: 1, limit: 200 }),
      apiService.getAdminDashboard(),
    ]);

    if (!analyticsResponse.data || !logsResponse.data || !dashboardResponse.data) {
      throw new Error(
        analyticsResponse.error || logsResponse.error || dashboardResponse.error || 'Unable to fetch report data.'
      );
    }

    const template = reportTemplates.find((t) => t.id === templateId);
    const reportName = template?.name || 'Admin Report';
    const headerRows = [
      ['Report', reportName],
      ['Generated At', new Date().toISOString()],
      ['Date Range', formatDateRangeLabel()],
      ['Template', templateId],
      [''],
    ];

    const dashboard = dashboardResponse.data;
    const analytics = analyticsResponse.data;
    const logs = logsResponse.data.logs;

    if (templateId === 'user-activity') {
      return {
        reportName,
        rows: [
          ...headerRows,
          ['Summary Metric', 'Value'],
          ['Total Users', dashboard.totalUsers],
          ['Total Players', dashboard.totalPlayers],
          ['Total Matches', dashboard.totalMatches],
          ['Total Clubs', dashboard.totalClubs],
          [''],
          ['Timestamp', 'User', 'Email', 'Action', 'Resource', 'Status', 'IP', 'Details'],
          ...logs.map((log) => [
            log.timestamp,
            log.user,
            log.userEmail,
            log.action,
            log.resource,
            log.status,
            log.ipAddress,
            log.details || '',
          ]),
        ],
      };
    }

    if (templateId === 'team-performance') {
      const playersResponse = await apiService.getTeamPerformancePlayersReport();
      if (!playersResponse.data) {
        throw new Error(playersResponse.error || 'Unable to fetch player squad details.');
      }
      return {
        reportName,
        rows: [
          ...headerRows,
          ['Team', 'Players', 'Injuries', 'Videos', 'Market Value (M)'],
          ...analytics.teamPerformance.map((team) => [
            team.name,
            team.players,
            team.injuries,
            team.videos,
            team.marketValue,
          ]),
          [''],
          ['Player Name', 'Team', 'Position', 'Age', 'Matches', 'Goals', 'Assists', 'Tackles', 'Interceptions', 'Minutes', 'Sprint', 'Stamina', 'Strength', 'Latest Risk', 'Latest Distance (m)'],
          ...playersResponse.data.players.map((player) => [
            player.name,
            player.teamName,
            player.position,
            player.age,
            player.stats.matches,
            player.stats.goals,
            player.stats.assists,
            player.stats.tackles,
            player.stats.interceptions,
            player.stats.minutesPlayed,
            player.physical.sprintSpeed,
            player.physical.stamina,
            player.physical.strength,
            player.latestMetrics ? Number((player.latestMetrics.riskScore || 0).toFixed(2)) : 0,
            player.latestMetrics ? player.latestMetrics.distanceM : 0,
          ]),
        ],
      };
    }

    if (templateId === 'market-value') {
      return {
        reportName,
        rows: [
          ...headerRows,
          ['Team', 'Players', 'Injuries', 'Videos', 'Market Value (M)'],
          ...analytics.teamPerformance.map((team) => [
            team.name,
            team.players,
            team.injuries,
            team.videos,
            team.marketValue,
          ]),
        ],
      };
    }

    if (templateId === 'system-usage') {
      return {
        reportName,
        rows: [
          ...headerRows,
          ['Month', 'Users', 'Videos', 'Players'],
          ...analytics.usageTrends.map((point) => [point.month, point.users, point.videos, point.players]),
          [''],
          ['Risk Distribution', 'Count'],
          ...analytics.injuryDistribution.map((risk) => [risk.name, risk.value]),
        ],
      };
    }

    if (templateId === 'injury-analysis') {
      return {
        reportName,
        rows: [
          ...headerRows,
          ['Risk Bucket', 'Count'],
          ...analytics.injuryDistribution.map((risk) => [risk.name, risk.value]),
          [''],
          ['Team', 'High-Risk Injuries'],
          ...analytics.teamPerformance.map((team) => [team.name, team.injuries]),
        ],
      };
    }

    return {
      reportName,
      rows: [
        ...headerRows,
        ['Summary Metric', 'Value'],
        ['Total Users', dashboard.totalUsers],
        ['Total Players', dashboard.totalPlayers],
        ['Total Matches', dashboard.totalMatches],
        ['Total Clubs', dashboard.totalClubs],
        ['Injury Alerts', dashboard.injuryAlerts],
        ['Portfolio Value', dashboard.totalPortfolioValue],
      ],
    };
  };

  const exportRows = (rows: Array<Array<string | number>>, reportName: string, selectedFormat: ExportFormat) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const safeName = reportName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');

    if (selectedFormat === 'csv') {
      downloadBlob(csvContent, `${safeName}_${timestamp}.csv`, 'text/csv;charset=utf-8;');
      return;
    }

    if (selectedFormat === 'excel') {
      const tsvContent = rows.map((row) => row.map((value) => String(value ?? '')).join('\t')).join('\n');
      downloadBlob(tsvContent, `${safeName}_${timestamp}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
      return;
    }

    const htmlRows = rows
      .map((row) => `<tr>${row.map((col) => `<td style="padding:6px;border:1px solid #ccc;">${String(col ?? '')}</td>`).join('')}</tr>`)
      .join('');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups to export as PDF.');
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>${reportName}</h1>
          <table style="border-collapse: collapse; width: 100%;">${htmlRows}</table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast({
        title: 'Error',
        description: 'Please select a report template',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      if (dateRange === 'custom' && (!startDate || !endDate)) {
        throw new Error('Please provide both start and end dates for a custom range.');
      }
      if (dateRange === 'custom' && new Date(startDate) > new Date(endDate)) {
        throw new Error('Start date cannot be after end date.');
      }
      const { rows, reportName } = await generateReportRows(selectedTemplate);
      exportRows(rows, reportName, format);
      await apiService.createReportRequest({
        templateId: selectedTemplate,
        format,
        dateRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: 'sent',
      }).catch(() => null);
      addRecentReport(selectedTemplate, reportName, format);
      toast({
        title: 'Report generated',
        description: `${reportName} exported successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to generate report',
        description: error instanceof Error ? error.message : 'Unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsGenerating(true);
    try {
      const template = reportTemplates.find((t) => t.id === templateId);
      const { rows, reportName } = await generateReportRows(templateId);
      exportRows(rows, reportName, format);
      await apiService.createReportRequest({
        templateId,
        format,
        dateRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: 'sent',
      }).catch(() => null);
      addRecentReport(templateId, reportName, format);
      toast({
        title: 'Export complete',
        description: `${template?.name || 'Report'} extracted as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Could not export report.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    if (!selectedTemplate) {
      toast({
        title: 'Select a template first',
        description: 'Choose a report template before emailing.',
        variant: 'destructive',
      });
      return;
    }

    if (dateRange === 'custom' && (!startDate || !endDate)) {
      toast({
        title: 'Missing date range',
        description: 'Please provide both start and end dates for a custom range.',
        variant: 'destructive',
      });
      return;
    }

    if (dateRange === 'custom' && new Date(startDate) > new Date(endDate)) {
      toast({
        title: 'Invalid date range',
        description: 'Start date cannot be after end date.',
        variant: 'destructive',
      });
      return;
    }

    setIsEmailing(true);
    try {
      const response = await apiService.queueReportEmail({
        templateId: selectedTemplate,
        format,
        dateRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (response.error || !response.data) {
        toast({
          title: 'Failed to queue email',
          description: response.error || 'Unknown server error',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Email queued',
        description: `Request ${response.data.requestId} is queued with status "${response.data.status}".`,
      });
      const templateName = reportTemplates.find((t) => t.id === selectedTemplate)?.name || selectedTemplate;
      setRecentReports((prev) => [
        {
          id: response.data.requestId,
          templateId: selectedTemplate,
          name: templateName,
          date: new Date().toISOString(),
          format: format.toUpperCase(),
          status: 'queued',
        },
        ...prev,
      ].slice(0, 25));
    } catch (error) {
      toast({
        title: 'Failed to queue email',
        description: error instanceof Error ? error.message : 'Unknown error while queueing email report.',
        variant: 'destructive',
      });
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Reports" 
        subtitle="Generate and export system reports"
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Report Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Select a template and configure report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label>Report Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report template" />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Export Format</Label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleGenerate} disabled={isGenerating || !selectedTemplate}>
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button variant="outline" onClick={handleEmailReport} disabled={isGenerating || isEmailing || !selectedTemplate}>
                <Mail className="w-4 h-4 mr-2" />
                {isEmailing ? 'Queueing Email...' : 'Email Report'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map(template => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isGenerating}
                        onClick={() => handleExport(template.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="mt-4">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your recently generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recentReports.length ? recentReports : [
                { id: 'seed-1', templateId: '', name: 'No reports in database yet', date: new Date().toISOString(), format: '—', status: 'sent' as const },
              ]).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(report.date).toLocaleDateString()} • {report.format} • {report.status}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isGenerating || !report.templateId}
                    onClick={() => {
                      if (report.templateId) {
                        handleExport(report.templateId);
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
