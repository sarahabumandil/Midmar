import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-primary/30 ai-border-glow',
    success: 'border-risk-low/30',
    warning: 'border-risk-medium/30',
    danger: 'border-risk-high/30',
  };

  const iconVariantStyles = {
    default: 'bg-secondary text-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-risk-low/10 text-risk-low',
    warning: 'bg-risk-medium/10 text-risk-medium',
    danger: 'bg-risk-high/10 text-risk-high',
  };

  return (
    <div className={cn(
      "stat-card border",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="metric-label mb-2">{title}</p>
          <p className="metric-value text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              trend.isPositive ? "text-risk-low" : "text-risk-high"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconVariantStyles[variant]
          )}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
