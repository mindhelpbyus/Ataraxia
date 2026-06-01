import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Building2,
  UserCog,
  Users,
  Headphones,
  DollarSign,
  FileText,
  CreditCard,
} from 'lucide-react';
import { cn } from './ui/utils';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category:
  | 'organizations'
  | 'therapists'
  | 'users'
  | 'support'
  | 'payments'
  | 'invoices'
  | 'billing';
  metadata?: string;
  status?: string;
}

interface GlobalSearchBarProps {
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSearch: (query: string) => Promise<SearchResult[]> | SearchResult[];
  onResultClick?: (result: SearchResult) => void;
  showKeyboardShortcut?: boolean;
  className?: string;
}

const CATEGORY_CONFIG: Record<
  SearchResult['category'],
  { label: string; icon: React.ReactNode; color: string }
> = {
  organizations: {
    label: 'Organizations',
    icon: <Building2 className="h-3.5 w-3.5" />,
    color: '#1E7048',
  },
  therapists: {
    label: 'Therapists',
    icon: <UserCog className="h-3.5 w-3.5" />,
    color: '#3B82F6',
  },
  users: {
    label: 'Users',
    icon: <Users className="h-3.5 w-3.5" />,
    color: '#10B981',
  },
  support: {
    label: 'Support tickets',
    icon: <Headphones className="h-3.5 w-3.5" />,
    color: '#EF4444',
  },
  payments: {
    label: 'Payments',
    icon: <DollarSign className="h-3.5 w-3.5" />,
    color: '#10B981',
  },
  invoices: {
    label: 'Invoices',
    icon: <FileText className="h-3.5 w-3.5" />,
    color: '#8B5CF6',
  },
  billing: {
    label: 'Billing',
    icon: <CreditCard className="h-3.5 w-3.5" />,
    color: '#F59E0B',
  },
};

const CATEGORY_ORDER: SearchResult['category'][] = [
  'organizations',
  'therapists',
  'users',
  'support',
  'payments',
  'invoices',
  'billing',
];

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const variants: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Paid: 'bg-green-100 text-green-800 border-green-200',
    Resolved: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Unpaid: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Failed: 'bg-red-100 text-red-800 border-red-200',
    Overdue: 'bg-red-100 text-red-800 border-red-200',
    'Action Required': 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap flex-shrink-0',
        variants[status] ?? 'bg-muted text-foreground border-border'
      )}
    >
      {status}
    </span>
  );
}

export function GlobalSearchBar({
  placeholder = 'Search organizations, therapists, users, tickets...',
  value,
  onValueChange,
  onSearch,
  onResultClick,
  showKeyboardShortcut = true,
  className,
}: GlobalSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Run search whenever value changes
  useEffect(() => {
    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const res = await onSearch(value);
        if (!cancelled) {
          setResults(res);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const debounce = setTimeout(run, 200);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [value, onSearch]);

  // ⌘K / Ctrl+K focus shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  // Click outside + keyboard navigation
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !results.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, results, selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    onValueChange('');
    onResultClick?.(result);
  };

  // Group and order results by category
  const grouped = results.reduce<Partial<Record<SearchResult['category'], SearchResult[]>>>(
    (acc, r) => {
      if (!acc[r.category]) acc[r.category] = [];
      acc[r.category]!.push(r);
      return acc;
    },
    {}
  );

  const flatResults = CATEGORY_ORDER.flatMap((cat) => grouped[cat] ?? []);

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      {/* Input row — filled style */}
      <div
        className={cn(
          'flex items-center gap-2.5 h-11 px-4 rounded-full transition-all duration-150',
          'bg-black/5 hover:bg-black/8',
          isFocused && 'bg-card border border-border shadow-sm'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'flex-1 h-full bg-transparent border-none outline-none ring-0',
            'text-sm placeholder:text-muted-foreground/60 text-foreground'
          )}
        />

        {showKeyboardShortcut && !value && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
              ⌘
            </kbd>
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
              K
            </kbd>
          </div>
        )}

        {isLoading && (
          <div className="h-4 w-4 rounded-full border-2 border-muted border-t-foreground animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No results for "{value}"</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Try organizations, therapists, users, or billing
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
                <span className="text-xs text-muted-foreground">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[11px] text-muted-foreground/50">
                  ↑↓ navigate · Enter select
                </span>
              </div>

              {/* Grouped results */}
              <div className="max-h-[420px] overflow-y-auto py-1">
                {CATEGORY_ORDER.map((cat) => {
                  const items = grouped[cat];
                  if (!items?.length) return null;
                  const config = CATEGORY_CONFIG[cat];

                  return (
                    <div key={cat}>
                      {/* Category header */}
                      <div className="flex items-center gap-2 px-4 py-2">
                        <span style={{ color: config.color }}>{config.icon}</span>
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          {config.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground/40">
                          ({items.length})
                        </span>
                      </div>

                      {/* Items */}
                      {items.map((result) => {
                        const globalIdx = flatResults.indexOf(result);
                        const isSelected = globalIdx === selectedIndex;

                        return (
                          <button
                            key={result.id}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            onClick={() => handleResultClick(result)}
                            className={cn(
                              'w-full text-left flex items-center justify-between gap-3 px-4 py-2 transition-colors',
                              isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {result.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {result.subtitle}
                                {result.metadata && (
                                  <>
                                    <span className="mx-1.5 opacity-40">·</span>
                                    {result.metadata}
                                  </>
                                )}
                              </p>
                            </div>
                            <StatusBadge status={result.status} />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
