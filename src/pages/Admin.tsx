import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatCard } from '@/components/ui/stat-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, UserRole } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Plus, Edit, Trash2, Shield, Users, Heart, TrendingUp, Video, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<{
    totalUsers: number;
    totalPlayers: number;
    injuryAlerts: number;
    totalMatches: number;
    totalClubs: number;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'user' as UserRole,
    teamName: '',
    password: '',
  });

  // Shared loader so we can refresh after edits/deletes
  const loadUsers = async () => {
    try {
      const response = await apiService.getAdminUsers();
      if (response.error || !response.data) {
        console.error('Error loading users:', response.error);
        toast({
          title: 'Error',
          description: response.error || 'Failed to load users from server.',
          variant: 'destructive',
        });
        return;
      }
      setUsers(response.data.users as User[]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please refresh the page.',
        variant: 'destructive',
      });
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      const response = await apiService.getAdminDashboard();
      if (response.error || !response.data) return;
      setDashboardMetrics({
        totalUsers: response.data.totalUsers,
        totalPlayers: response.data.totalPlayers,
        injuryAlerts: response.data.injuryAlerts,
        totalMatches: response.data.totalMatches,
        totalClubs: response.data.totalClubs,
      });
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadDashboardMetrics();
  }, []);

  // Filter out admin users for display
  const regularUsers = users.filter(u => u.role === 'user');
  const totalUsers = dashboardMetrics?.totalUsers ?? 0;
  const totalPlayers = dashboardMetrics?.totalPlayers ?? 0;
  const totalInjuries = dashboardMetrics?.injuryAlerts ?? 0;
  const totalVideos = dashboardMetrics?.totalMatches ?? 0;

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
        teamName: user.teamInfo?.name || '',
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        name: '',
        role: 'user',
        teamName: '',
        password: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      role: 'user',
      teamName: '',
      password: '',
    });
  };

  const handleSubmit = async () => {
    // Creating a brand new user
    if (!editingUser) {
      // Basic validation
      if (!formData.email || !formData.name || !formData.password || !formData.teamName) {
        toast({
          title: 'Missing fields',
          description: 'Email, name, password, and team name are required to create a user.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: 'Weak password',
          description: 'Password must be at least 6 characters long.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await apiService.createAdminUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          teamName: formData.teamName,
        });

        if (response.error || !response.data) {
          throw new Error(response.error || 'Failed to create user');
        }

        toast({
          title: 'User created',
          description: 'New user has been created in the database.',
        });

        await loadUsers();
        handleCloseDialog();
      } catch (error) {
        console.error('Error creating user:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred while creating user',
          variant: 'destructive',
        });
      }
      return;
    }

    // Editing an existing user
    try {
      const updates: any = {
        name: formData.name,
        role: formData.role,
        teamName: formData.teamName,
      };

      // Only send password if admin actually entered one
      if (formData.password.trim()) {
        updates.password = formData.password;
      }

      const response = await apiService.updateAdminUser(editingUser.email, updates);

      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to update user');
      }

      toast({
        title: 'User updated',
        description: 'User has been successfully updated in the database.',
      });

      await loadUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while updating user',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) {
      return;
    }

    try {
      const response = await apiService.deleteAdminUser(email);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'User deleted',
        description: 'User has been removed from the database.',
      });

      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while deleting user',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Admin Dashboard" 
        subtitle="Overview of all users and their teams"
      />
      
      <div className="p-6 space-y-6 animate-fade-in bg-background">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle="Active accounts"
            icon={Users}
          />
          <StatCard
            title="Total Players"
            value={totalPlayers}
            subtitle="In players database"
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Injury Alerts"
            value={totalInjuries}
            subtitle="Across all teams"
            icon={Heart}
            variant="danger"
          />
          <StatCard
            title="Videos Analyzed"
            value={totalVideos}
            subtitle={dashboardMetrics ? `Across ${dashboardMetrics.totalClubs} clubs` : 'This month'}
            icon={Video}
            variant="success"
          />
        </div>

        {/* Users and Teams Grid */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Users & Teams</h2>
            <p className="text-muted-foreground">Manage users and view their team analytics</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="group">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularUsers.map((user) => (
            <div key={user.email} className="stat-card group hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(user.email)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {user.teamInfo && (
                <>
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-primary">{user.teamInfo.name}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Players</p>
                      <p className="text-2xl font-bold">
                        {typeof (user as any).playerCount === 'number'
                          ? (user as any).playerCount
                          : user.teamInfo.totalPlayers}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Injuries</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        user.teamInfo.injuryAlerts > 2 ? "text-destructive" : 
                        user.teamInfo.injuryAlerts > 0 ? "text-warning" : "text-foreground"
                      )}>
                        {user.teamInfo.injuryAlerts}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Market Value</p>
                      <p className="text-xl font-bold text-primary">{user.teamInfo.marketValue}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Videos</p>
                      <p className="text-2xl font-bold">{user.teamInfo.videosAnalyzed}</p>
                    </div>
                  </div>
                </>
              )}

              {!user.teamInfo && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No team information</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {regularUsers.length === 0 && (
          <div className="stat-card text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No users yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first user</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        )}

        {/* Add/Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update user information and team details.' 
                  : 'Enter user details to create a new account with a team.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingUser}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={editingUser ? 'Leave blank to keep existing' : 'Set an initial password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  type="text"
                  placeholder="Manchester United"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
