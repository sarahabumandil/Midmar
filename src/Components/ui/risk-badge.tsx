import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, showLabel = true, size = 'md' }: RiskBadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const labels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      sizeStyles[size],
      level === 'low' && "risk-badge-low",
      level === 'medium' && "risk-badge-medium",
      level === 'high' && "risk-badge-high",
    )}>
      <span className={cn(
        "w-2 h-2 rounded-full",
        level === 'low' && "bg-risk-low",
        level === 'medium' && "bg-risk-medium",
        level === 'high' && "bg-risk-high",
      )} />
      {showLabel && labels[level]}
    </span>
  );
}
