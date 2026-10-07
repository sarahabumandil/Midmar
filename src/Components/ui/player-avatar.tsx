import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerAvatarProps {
  name: string;
  imageUrl?: string;
  className?: string;
  iconClassName?: string;
}

export function PlayerAvatar({ name, imageUrl, className, iconClassName }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl?.trim();
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn('overflow-hidden bg-secondary border border-border flex items-center justify-center', className)}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <User className={cn('w-5 h-5 text-muted-foreground', iconClassName)} />
      )}
    </div>
  );
}
