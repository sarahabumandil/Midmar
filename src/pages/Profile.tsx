import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { 
  User, 
  Mail, 
  Shield, 
  Users, 
  Calendar,
  Activity,
  Settings,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState(user?.name || '');
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [privacyForm, setPrivacyForm] = useState({
    profileVisibility: 'team' as 'private' | 'team' | 'public',
    activityTracking: true,
    dataSharing: false,
  });
  const [notificationForm, setNotificationForm] = useState({
    emailAlerts: true,
    injuryRiskAlerts: true,
    weeklySummary: true,
    matchInsightsReady: true,
  });
  const [teamSettingsForm, setTeamSettingsForm] = useState({
    preferredFormation: '',
    playStyle: '',
    trainingFocus: '',
    notes: '',
  });
  const [openDialog, setOpenDialog] = useState<null | 'edit' | 'email' | 'password' | 'privacy' | 'notify' | 'team'>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const recentActivities = [
    { id: 1, action: 'Player added', target: 'John Doe', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Injury prediction', target: '3 players analyzed', time: '5 hours ago', type: 'info' },
    { id: 3, action: 'Market value updated', target: 'Team portfolio', time: '1 day ago', type: 'success' },
    { id: 4, action: 'Video analyzed', target: 'Match footage', time: '2 days ago', type: 'info' },
  ];

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name || '');
    apiService.getMyProfile().then((response) => {
      if (!response.data) return;
      if (response.data.preferences?.privacy) setPrivacyForm(response.data.preferences.privacy);
      if (response.data.preferences?.notifications) setNotificationForm(response.data.preferences.notifications);
      if (response.data.teamSettings) setTeamSettingsForm(response.data.teamSettings);
    });
  }, [user]);

  const handleSaveProfile = async () => {
    const response = await apiService.updateMyProfile(profileName);
    if (response.error) {
      toast({ title: 'Update failed', description: response.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Profile updated', description: 'Your name was updated successfully.' });
    setOpenDialog(null);
    window.location.reload();
  };

  const handleSaveEmail = async () => {
    const response = await apiService.changeMyEmail(emailForm.currentPassword, emailForm.newEmail);
    if (response.error) {
      toast({ title: 'Email update failed', description: response.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Email updated', description: 'Please use your new email on next login.' });
    setOpenDialog(null);
    window.location.reload();
  };

  const handleSavePassword = async () => {
    const response = await apiService.changeMyPassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (response.error) {
      toast({ title: 'Password update failed', description: response.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Password updated', description: 'Your password has been changed.' });
    setOpenDialog(null);
    setPasswordForm({ currentPassword: '', newPassword: '' });
  };

  const handleSavePrivacy = async () => {
    const response = await apiService.updateMyPreferences({ privacy: privacyForm });
    if (response.error) {
      toast({ title: 'Privacy update failed', description: response.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Privacy settings saved' });
    setOpenDialog(null);
  };

  const handleSaveNotifications = async () => {
    const response = await apiService.updateMyPreferences({ notifications: notificationForm });
    if (response.error) {
      toast({ title: 'Notification update failed', description: response.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Notification settings saved' });
    setOpenDialog(null);
  };

  const handleSaveTeamSettings = async () => {
    const response = await apiService.updateTeamSettings(teamSettingsForm);
    if (response.error) {
      toast({ title: 'Team settings update failed', description: response.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Team settings updated' });
    setOpenDialog(null);
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Profile" 
        subtitle={user?.role === 'admin' ? 'Your account details' : 'Your account and team details'} 
      />

      <div className="p-6 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card className="ai-glow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="w-24 h-24 border-2 border-primary/20">
                  <AvatarImage src="" alt={user?.name || 'User'} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{user?.name || 'Unknown User'}</h2>
                    <Badge variant={user?.role === 'admin' ? 'destructive' : 'default'} className="capitalize">
                      {user?.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          User
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => setOpenDialog('edit')}>
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="account" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="account" className="gap-2">
                <User className="w-4 h-4" />
                Account
              </TabsTrigger>
              {user?.role !== 'admin' && (
                <TabsTrigger value="team" className="gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </TabsTrigger>
              )}
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your personal account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Full Name</span>
                      </div>
                      <p className="text-lg font-semibold">{user?.name || 'Unknown'}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Email Address</span>
                      </div>
                      <p className="text-lg font-semibold">{user?.email || 'Unknown'}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Account Role</span>
                      </div>
                      <Badge variant={user?.role === 'admin' ? 'destructive' : 'default'} className="text-sm capitalize">
                        {user?.role || 'user'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Member Since</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {new Date().toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start" onClick={() => setOpenDialog('password')}>
                        Change Password
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setOpenDialog('email')}>
                        Update Email
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setOpenDialog('privacy')}>
                        Privacy Settings
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setOpenDialog('notify')}>
                        Notification Preferences
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab - Only for non-admin users */}
            {user?.role !== 'admin' && (
              <TabsContent value="team" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Information</CardTitle>
                    <CardDescription>Details about your football team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Team Name</span>
                      </div>
                      <p className="text-2xl font-bold">{user?.teamInfo?.name || 'No team configured'}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          Total Players
                        </p>
                        <p className="text-3xl font-bold">{user?.teamInfo?.totalPlayers ?? 0}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          Injury Alerts
                        </p>
                        <p className="text-3xl font-bold text-destructive">
                          {user?.teamInfo?.injuryAlerts ?? 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-risk-low/10 border border-risk-low/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          Market Value
                        </p>
                        <p className="text-3xl font-bold text-risk-low">
                          {user?.teamInfo?.marketValue ?? '€0M'}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          Videos Analyzed
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {user?.teamInfo?.videosAnalyzed ?? 0}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-4">
                      <Button variant="default" onClick={() => navigate('/players')}>
                        Manage Players
                      </Button>
                      <Button variant="outline" onClick={() => setOpenDialog('team')}>
                        Team Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={activity.id}>
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 p-2 rounded-full ${
                            activity.type === 'success' 
                              ? 'bg-risk-low/10 text-risk-low' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {activity.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.target}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        {index < recentActivities.length - 1 && (
                          <Separator className="my-4 ml-12" />
                        )}
                      </div>
                    ))}
                  </div>
                  {recentActivities.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={openDialog === 'edit'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle><DialogDescription>Update your display name.</DialogDescription></DialogHeader>
          <Label>Name</Label>
          <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
          <DialogFooter><Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button><Button onClick={handleSaveProfile}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'email'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Email</DialogTitle><DialogDescription>Confirm your password to change email.</DialogDescription></DialogHeader>
          <Label>Current Password</Label>
          <Input type="password" value={emailForm.currentPassword} onChange={(e) => setEmailForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          <Label>New Email</Label>
          <Input type="email" value={emailForm.newEmail} onChange={(e) => setEmailForm((p) => ({ ...p, newEmail: e.target.value }))} />
          <DialogFooter><Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button><Button onClick={handleSaveEmail}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'password'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle><DialogDescription>Set a new password for your account.</DialogDescription></DialogHeader>
          <Label>Current Password</Label>
          <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          <Label>New Password</Label>
          <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
          <DialogFooter><Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button><Button onClick={handleSavePassword}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'privacy'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Privacy Settings</DialogTitle><DialogDescription>Manage visibility and data sharing.</DialogDescription></DialogHeader>
          <Label>Profile Visibility</Label>
          <Input value={privacyForm.profileVisibility} onChange={(e) => setPrivacyForm((p) => ({ ...p, profileVisibility: e.target.value as 'private' | 'team' | 'public' }))} />
          <Label>Activity Tracking (true/false)</Label>
          <Input value={String(privacyForm.activityTracking)} onChange={(e) => setPrivacyForm((p) => ({ ...p, activityTracking: e.target.value.toLowerCase() === 'true' }))} />
          <Label>Data Sharing (true/false)</Label>
          <Input value={String(privacyForm.dataSharing)} onChange={(e) => setPrivacyForm((p) => ({ ...p, dataSharing: e.target.value.toLowerCase() === 'true' }))} />
          <DialogFooter><Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button><Button onClick={handleSavePrivacy}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'notify'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Notification Preferences</DialogTitle><DialogDescription>Configure alert channels and summaries.</DialogDescription></DialogHeader>
          <Label>Email Alerts (true/false)</Label>
          <Input value={String(notificationForm.emailAlerts)} onChange={(e) => setNotificationForm((p) => ({ ...p, emailAlerts: e.target.value.toLowerCase() === 'true' }))} />
          <Label>Injury Risk Alerts (true/false)</Label>
          <Input value={String(notificationForm.injuryRiskAlerts)} onChange={(e) => setNotificationForm((p) => ({ ...p, injuryRiskAlerts: e.target.value.toLowerCase() === 'true' }))} />
          <Label>Weekly Summary (true/false)</Label>
          <Input value={String(notificationForm.weeklySummary)} onChange={(e) => setNotificationForm((p) => ({ ...p, weeklySummary: e.target.value.toLowerCase() === 'true' }))} />
          <Label>Match Insights Ready (true/false)</Label>
          <Input value={String(notificationForm.matchInsightsReady)} onChange={(e) => setNotificationForm((p) => ({ ...p, matchInsightsReady: e.target.value.toLowerCase() === 'true' }))} />
          <DialogFooter><Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button><Button onClick={handleSaveNotifications}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'team'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Team Settings</DialogTitle><DialogDescription>Update your team tactical defaults.</DialogDescription></DialogHeader>
          <Label>Preferred Formation</Label>
          <Input value={teamSettingsForm.preferredFormation} onChange={(e) => setTeamSettingsForm((p) => ({ ...p, preferredFormation: e.target.value }))} />
          <Label>Play Style</Label>
          <Input value={teamSettingsForm.playStyle} onChange={(e) => setTeamSettingsForm((p) => ({ ...p, playStyle: e.target.value }))} />
          <Label>Training Focus</Label>
          <Input value={teamSettingsForm.trainingFocus} onChange={(e) => setTeamSettingsForm((p) => ({ ...p, trainingFocus: e.target.value }))} />
          <Label>Notes</Label>
          <Input value={teamSettingsForm.notes} onChange={(e) => setTeamSettingsForm((p) => ({ ...p, notes: e.target.value }))} />
          <DialogFooter><Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button><Button onClick={handleSaveTeamSettings}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

