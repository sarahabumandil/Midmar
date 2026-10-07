import { Brain, Heart, TrendingUp, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardActivityItem } from '@/services/api';

const iconMap = {
  injury: Heart,
  value: TrendingUp,
  video: Video,
  ai: Brain,
};

const colorMap = {
  injury: 'text-risk-high bg-risk-high/10',
  value: 'text-risk-low bg-risk-low/10',
  video: 'text-primary bg-primary/10',
  ai: 'text-primary bg-primary/10',
};

interface RecentActivityProps {
  activities: DashboardActivityItem[];
}

const relativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMin = Math.floor((now - date.getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="stat-card">
      <h3 className="font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        )}
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                colorMap[activity.type]
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime(activity.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
