import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

type RosterRow = {
  id: string;
  name: string;
  globalId?: number;
  shirtNumber?: number;
  position: string;
  team: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const onPlayersPage = location.pathname === '/players';
  const searchFromUrl = searchParams.get('search') ?? '';

  const searchValue = onPlayersPage ? searchFromUrl : draft;

  useEffect(() => {
    if (!onPlayersPage) {
      setDraft('');
    }
  }, [onPlayersPage]);

  useEffect(() => {
    if (!user) {
      setRoster([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await apiService.getMyPlayers();
      if (cancelled || !res.data?.players) return;
      setRoster(
        res.data.players.map((p: RosterRow) => ({
          id: p.id,
          name: p.name,
          globalId: p.globalId,
          shirtNumber: p.shirtNumber,
          position: p.position,
          team: p.team,
        }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const { playerSuggestions, teamSuggestions } = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (q.length < 1) {
      return { playerSuggestions: [] as RosterRow[], teamSuggestions: [] as string[] };
    }
    const playerSuggestions = roster
      .filter((p) => {
        const name = (p.name || '').toLowerCase();
        const pos = (p.position || '').toLowerCase();
        const team = (p.team || '').toLowerCase();
        const gid = String(p.globalId ?? p.shirtNumber ?? '');
        return (
          name.includes(q) ||
          pos.includes(q) ||
          team.includes(q) ||
          gid.includes(q)
        );
      })
      .slice(0, 8);

    const teams = [...new Set(roster.map((p) => p.team).filter(Boolean))] as string[];
    const teamSuggestions = teams.filter((t) => t.toLowerCase().includes(q)).slice(0, 3);

    return { playerSuggestions, teamSuggestions };
  }, [searchValue, roster]);

  const hasSuggestions =
    suggestOpen &&
    searchValue.trim().length > 0 &&
    (playerSuggestions.length > 0 || teamSuggestions.length > 0);

  const setSearchValue = (v: string) => {
    if (onPlayersPage) {
      if (v) setSearchParams({ search: v }, { replace: true });
      else setSearchParams({}, { replace: true });
    } else {
      setDraft(v);
    }
    setSuggestOpen(true);
  };

  const applySearch = (text: string) => {
    const q = text.trim();
    navigate(q ? `/players?search=${encodeURIComponent(q)}` : '/players');
    setSuggestOpen(false);
  };

  const commitSearch = () => {
    const q = (onPlayersPage ? searchFromUrl : draft).trim();
    applySearch(q);
  };

  const selectPlayer = (p: RosterRow) => {
    applySearch(p.name);
  };

  const selectTeam = (team: string) => {
    applySearch(team);
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div ref={wrapRef} className="relative z-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            placeholder="Search players, teams..."
            className="pl-10 w-72 bg-secondary border-border focus:border-primary"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitSearch();
              }
              if (e.key === 'Escape') setSuggestOpen(false);
            }}
            onFocus={() => setSuggestOpen(true)}
            aria-label="Search players"
            autoComplete="off"
          />

          {hasSuggestions && (
            <div
              className="absolute right-0 top-full mt-1 w-72 rounded-md border border-border bg-popover text-popover-foreground shadow-md py-1 max-h-72 overflow-y-auto"
              role="listbox"
            >
              {teamSuggestions.map((team) => (
                <button
                  key={`team-${team}`}
                  type="button"
                  role="option"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectTeam(team)}
                >
                  <span className="text-muted-foreground text-xs">Team · </span>
                  {team}
                </button>
              ))}
              {playerSuggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex flex-col gap-0.5"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectPlayer(p)}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    #{p.globalId ?? p.shirtNumber ?? '—'} · {p.position}
                    {p.team ? ` · ${p.team}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate('/profile')}
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </Button>
      </div>
    </header>
  );
}
