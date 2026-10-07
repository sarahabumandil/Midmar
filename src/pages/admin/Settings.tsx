import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Bell,
  Shield,
  Database,
  Server
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'FootBrain',
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: false,
    
    // Feature Toggles
    enableInjuryPrediction: true,
    enableMarketValue: true,
    enableVideoAnalysis: true,
    enablePlayerManagement: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    
    // Security
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enable2FA: false,
    
    // System
    maxFileUploadSize: 100,
    videoProcessingQueue: 10,
    dataRetentionDays: 365,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Settings saved',
      description: 'System settings have been updated successfully.',
    });
    setIsSaving(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to defaults
      setSettings({
        platformName: 'FootBrain',
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: false,
        enableInjuryPrediction: true,
        enableMarketValue: true,
        enableVideoAnalysis: true,
        enablePlayerManagement: true,
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        enable2FA: false,
        maxFileUploadSize: 100,
        videoProcessingQueue: 10,
        dataRetentionDays: 365,
      });
      toast({
        title: 'Settings reset',
        description: 'All settings have been reset to default values.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="System Settings" 
        subtitle="Platform configuration and feature management"
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable access for all users except admins
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow New Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable new user sign-ups
                </p>
              </div>
              <Switch
                checked={settings.allowNewRegistrations}
                onCheckedChange={(checked) => setSettings({ ...settings, allowNewRegistrations: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require users to verify their email before accessing the platform
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <CardTitle>Feature Toggles</CardTitle>
            </div>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Injury Prediction</Label>
                <p className="text-sm text-muted-foreground">ML-powered injury risk assessment</p>
              </div>
              <Switch
                checked={settings.enableInjuryPrediction}
                onCheckedChange={(checked) => setSettings({ ...settings, enableInjuryPrediction: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Market Value Analysis</Label>
                <p className="text-sm text-muted-foreground">XGBoost player valuation models</p>
              </div>
              <Switch
                checked={settings.enableMarketValue}
                onCheckedChange={(checked) => setSettings({ ...settings, enableMarketValue: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Video Analysis</Label>
                <p className="text-sm text-muted-foreground">YOLOv8 and OpenPose video processing</p>
              </div>
              <Switch
                checked={settings.enableVideoAnalysis}
                onCheckedChange={(checked) => setSettings({ ...settings, enableVideoAnalysis: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Player Management</Label>
                <p className="text-sm text-muted-foreground">Player database and profiles</p>
              </div>
              <Switch
                checked={settings.enablePlayerManagement}
                onCheckedChange={(checked) => setSettings({ ...settings, enablePlayerManagement: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email alerts and updates</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Automated weekly analytics reports</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Authentication and security configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin accounts
                </p>
              </div>
              <Switch
                checked={settings.enable2FA}
                onCheckedChange={(checked) => setSettings({ ...settings, enable2FA: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle>System Configuration</CardTitle>
            </div>
            <CardDescription>Resource limits and data management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
              <Input
                id="maxFileUploadSize"
                type="number"
                value={settings.maxFileUploadSize}
                onChange={(e) => setSettings({ ...settings, maxFileUploadSize: parseInt(e.target.value) || 100 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="videoProcessingQueue">Video Processing Queue Size</Label>
              <Input
                id="videoProcessingQueue"
                type="number"
                value={settings.videoProcessingQueue}
                onChange={(e) => setSettings({ ...settings, videoProcessingQueue: parseInt(e.target.value) || 10 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dataRetentionDays">Data Retention Period (days)</Label>
              <Input
                id="dataRetentionDays"
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) || 365 })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Warning Banner */}
        {settings.maintenanceMode && (
          <div className="stat-card border-destructive/50 bg-destructive/10">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <h4 className="font-semibold text-destructive">Maintenance Mode Active</h4>
                <p className="text-sm text-muted-foreground">
                  The platform is currently in maintenance mode. Only administrators can access the system.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
