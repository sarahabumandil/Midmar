import { PlayerData } from '@/services/mockAIService';
import { cn } from '@/lib/utils';
import { User, MapPin, Flag } from 'lucide-react';
import { PlayerAvatar } from '@/components/ui/player-avatar';

interface PlayerCardProps {
  player: PlayerData;
  onClick?: () => void;
  isSelected?: boolean;
  compact?: boolean;
  /** When true with compact: classic slim sidebar row — no stat grid; use with showAvatar={false} for Market/Injury. */
  minimalCompact?: boolean;
  showAvatar?: boolean;
  imageUrl?: string;
  stats?: {
    matches?: number;
    goals?: number;
    assists?: number;
    age?: number;
  };
}

export function PlayerCard({
  player,
  onClick,
  isSelected,
  compact,
  minimalCompact = false,
  showAvatar = true,
  imageUrl,
  stats,
}: PlayerCardProps) {
  const resolvedImageUrl = imageUrl ?? player.imageUrl;
  const resolvedStats = {
    matches: stats?.matches ?? player.stats.matches ?? 0,
    goals: stats?.goals ?? player.stats.goals ?? 0,
    assists: stats?.assists ?? player.stats.assists ?? 0,
    age: stats?.age ?? player.age ?? 0,
  };
  const statBoxClass =
    'text-center rounded-xl border-2 border-emerald-500/70 bg-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-3 min-h-[76px] flex flex-col items-center justify-center';

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className={cn(
          'rounded-lg border transition-all cursor-pointer',
          'p-3',
          minimalCompact
            ? isSelected
              ? 'border-primary bg-primary/5 ai-border-glow'
              : 'border-border hover:border-primary/30 bg-card'
            : isSelected
              ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.2)]'
              : 'border-border hover:border-emerald-500/40 bg-card',
        )}
      >
        <div className="flex items-center gap-3">
          {showAvatar ? (
            <PlayerAvatar
              name={player.name}
              imageUrl={resolvedImageUrl}
              className={cn(
                'shrink-0',
                minimalCompact ? 'w-10 h-10 rounded-full' : 'w-12 h-12 rounded-md',
              )}
              iconClassName={minimalCompact ? 'w-5 h-5' : 'w-5 h-5'}
            />
          ) : (
            <div
              className={cn(
                'bg-secondary shrink-0 flex items-center justify-center',
                minimalCompact ? 'w-10 h-10 rounded-full' : 'w-12 h-12 rounded-md',
              )}
            >
              <User className={cn('text-muted-foreground', minimalCompact ? 'w-5 h-5' : 'w-5 h-5')} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{player.name}</p>
            <p className="text-xs text-muted-foreground">
              #{player.shirtNumber ?? player.globalId ?? '-'} • {player.position} • {player.team}
            </p>
          </div>
        </div>
        {!minimalCompact && (
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
            <div className={statBoxClass}>
              <p className="text-2xl font-bold text-emerald-200 leading-none tabular-nums">{resolvedStats.matches}</p>
              <p className="text-[11px] font-semibold text-emerald-100 mt-1 uppercase tracking-wider">Matches</p>
            </div>
            <div className={statBoxClass}>
              <p className="text-2xl font-bold text-emerald-200 leading-none tabular-nums">{resolvedStats.goals}</p>
              <p className="text-[11px] font-semibold text-emerald-100 mt-1 uppercase tracking-wider">Goals</p>
            </div>
            <div className={statBoxClass}>
              <p className="text-2xl font-bold text-emerald-200 leading-none tabular-nums">{resolvedStats.assists}</p>
              <p className="text-[11px] font-semibold text-emerald-100 mt-1 uppercase tracking-wider">Assists</p>
            </div>
            <div className={statBoxClass}>
              <p className="text-2xl font-bold text-emerald-200 leading-none tabular-nums">{resolvedStats.age}</p>
              <p className="text-[11px] font-semibold text-emerald-100 mt-1 uppercase tracking-wider">Age</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={cn(
        "stat-card cursor-pointer transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]",
        isSelected && "border-emerald-500 shadow-[0_0_22px_rgba(16,185,129,0.22)] bg-emerald-500/[0.06]"
      )}
    >
      <div className="flex items-start gap-4">
        <PlayerAvatar
          name={player.name}
          imageUrl={resolvedImageUrl}
          className="w-20 h-20 rounded-xl flex-shrink-0 border-2 border-emerald-500/50"
          iconClassName="w-9 h-9"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{player.name}</h3>
          <p className="text-emerald-300 font-medium">{player.position}</p>
          <p className="text-xs text-muted-foreground mt-1">T-shirt: #{player.shirtNumber ?? player.globalId ?? '-'}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {player.team}
            </span>
            <span className="flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" />
              {player.nationality}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
        <div className={statBoxClass}>
          <p className="text-2xl font-bold text-emerald-200 tabular-nums">{resolvedStats.matches}</p>
          <p className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Matches</p>
        </div>
        <div className={statBoxClass}>
          <p className="text-2xl font-bold text-emerald-200 tabular-nums">{resolvedStats.goals}</p>
          <p className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Goals</p>
        </div>
        <div className={statBoxClass}>
          <p className="text-2xl font-bold text-emerald-200 tabular-nums">{resolvedStats.assists}</p>
          <p className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Assists</p>
        </div>
        <div className={statBoxClass}>
          <p className="text-2xl font-bold text-emerald-200 tabular-nums">{resolvedStats.age}</p>
          <p className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Age</p>
        </div>
      </div>
    </div>
  );
}
