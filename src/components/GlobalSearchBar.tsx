import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Search,
  Building2,
  UserCog,
  Users,
  Headphones,
  DollarSign,
  FileText,
  CreditCard,
  Command,
  TrendingUp,
  Clock,
  Mail,
} from 'lucide-react';
import { cn } from './ui/utils';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'organizations' | 'therapists' | 'users' | 'support' | 'payments' | 'invoices' | 'billing';
  metadata?: string;
  status?: string;
}

interface GlobalSearchBarProps {
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  onResultClick?: (result: SearchResult) => void;
  showKeyboardShortcut?: boolean;
  className?: string; // Added optional className prop
}

export function GlobalSearchBar({
  placeholder = "Global search across organizations, therapists, users, tickets...",
  value,
  onValueChange,
  onResultClick,
  showKeyboardShortcut = true,
  className,
}: GlobalSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search function - replace with actual API call
  const searchGlobal = (query: string): SearchResult[] => {
    if (!query || query.length < 2) return [];

    const allResults: SearchResult[] = [
      // Organizations
      {
        id: 'org-1',
        title: 'Wellness Care Center',
        subtitle: 'wellnesscare.ataraxia.com',
        category: 'organizations',
        metadata: '12 providers • 245 clients',
        status: 'Active',
      },
      {
        id: 'org-2',
        title: 'Mindful Therapy Group',
        subtitle: 'mindfultherapy.ataraxia.com',
        category: 'organizations',
        metadata: '45 providers • 892 clients',
        status: 'Active',
      },
      {
        id: 'org-3',
        title: 'Hope Counseling Services',
        subtitle: 'hopecounseling.ataraxia.com',
        category: 'organizations',
        metadata: '5 providers • 78 clients',
        status: 'Active',
      },
      // Therapists
      {
        id: 'therapist-1',
        title: 'Dr. Sarah Mitchell',
        subtitle: 'sarah.mitchell@wellnesscare.com',
        category: 'therapists',
        metadata: 'Wellness Care Center • CBT Specialist',
        status: 'Active',
      },
      {
        id: 'therapist-2',
        title: 'Dr. Michael Chen',
        subtitle: 'michael.chen@mindfultherapy.com',
        category: 'therapists',
        metadata: 'Mindful Therapy Group • EMDR Certified',
        status: 'Active',
      },
      {
        id: 'therapist-3',
        title: 'Emily Rodriguez, LMFT',
        subtitle: 'emily.r@hopecounseling.com',
        category: 'therapists',
        metadata: 'Hope Counseling Services • Family Therapy',
        status: 'Active',
      },
      // Users/Clients
      {
        id: 'user-1',
        title: 'John Davis',
        subtitle: 'john.davis@email.com',
        category: 'users',
        metadata: 'Client • Wellness Care Center',
        status: 'Active',
      },
      {
        id: 'user-2',
        title: 'Lisa Anderson',
        subtitle: 'lisa.anderson@email.com',
        category: 'users',
        metadata: 'Admin • Serenity Wellness',
        status: 'Active',
      },
      // Support Tickets
      {
        id: 'ticket-1',
        title: 'Login Issues - Unable to access calendar',
        subtitle: 'Ticket #2451',
        category: 'support',
        metadata: 'Wellness Care Center • Opened 2 hours ago',
        status: 'Open',
      },
      {
        id: 'ticket-2',
        title: 'Video call not connecting',
        subtitle: 'Ticket #2448',
        category: 'support',
        metadata: 'Mindful Therapy Group • Opened yesterday',
        status: 'In Progress',
      },
      {
        id: 'ticket-3',
        title: 'Billing discrepancy report',
        subtitle: 'Ticket #2445',
        category: 'support',
        metadata: 'Hope Counseling Services • Opened 3 days ago',
        status: 'Resolved',
      },
      // Payments
      {
        id: 'payment-1',
        title: 'Payment received - $1,250.00',
        subtitle: 'PMT-2024-11-001',
        category: 'payments',
        metadata: 'Wellness Care Center • Nov 24, 2025',
        status: 'Completed',
      },
      {
        id: 'payment-2',
        title: 'Payment pending - $3,450.00',
        subtitle: 'PMT-2024-11-002',
        category: 'payments',
        metadata: 'Mindful Therapy Group • Nov 23, 2025',
        status: 'Pending',
      },
      {
        id: 'payment-3',
        title: 'Payment failed - $875.00',
        subtitle: 'PMT-2024-11-003',
        category: 'payments',
        metadata: 'Hope Counseling Services • Nov 22, 2025',
        status: 'Failed',
      },
      // Invoices
      {
        id: 'invoice-1',
        title: 'Invoice #INV-2024-1145',
        subtitle: '$1,250.00 - November 2025',
        category: 'invoices',
        metadata: 'Wellness Care Center • Due: Dec 1, 2025',
        status: 'Paid',
      },
      {
        id: 'invoice-2',
        title: 'Invoice #INV-2024-1146',
        subtitle: '$3,450.00 - November 2025',
        category: 'invoices',
        metadata: 'Mindful Therapy Group • Due: Dec 1, 2025',
        status: 'Unpaid',
      },
      {
        id: 'invoice-3',
        title: 'Invoice #INV-2024-1144',
        subtitle: '$875.00 - November 2025',
        category: 'invoices',
        metadata: 'Hope Counseling Services • Due: Nov 30, 2025',
        status: 'Overdue',
      },
      // Billing
      {
        id: 'billing-1',
        title: 'Subscription Renewal - Pro Plan',
        subtitle: 'Wellness Care Center',
        category: 'billing',
        metadata: '$199/month • Next billing: Dec 15, 2025',
        status: 'Active',
      },
      {
        id: 'billing-2',
        title: 'Subscription Upgrade - Enterprise Plan',
        subtitle: 'Mindful Therapy Group',
        category: 'billing',
        metadata: '$599/month • Next billing: Dec 20, 2025',
        status: 'Active',
      },
      {
        id: 'billing-3',
        title: 'Payment Method Expired',
        subtitle: 'Serenity Wellness',
        category: 'billing',
        metadata: 'Card ending in 4242 • Requires update',
        status: 'Action Required',
      },
    ];

    // Filter results based on query
    const filtered = allResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        result.metadata?.toLowerCase().includes(query.toLowerCase())
    );

    return filtered;
  };

  useEffect(() => {
    if (value.length >= 2) {
      const searchResults = searchGlobal(value);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [value]);

  // Keyboard shortcut handler - separate effect for Cmd/Ctrl + K
  useEffect(() => {
    const handleGlobalKeyboard = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'K')) {
        event.preventDefault();
        event.stopPropagation();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyboard, true);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyboard, true);
    };
  }, []);

  // Navigation and interaction handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyboard = (event: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
      } else if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyboard);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [isOpen, results, selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    onValueChange('');
    onResultClick?.(result);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'organizations':
        return <Building2 className="h-4 w-4 text-[#F97316]" />;
      case 'therapists':
        return <UserCog className="h-4 w-4 text-[#3B82F6]" />;
      case 'users':
        return <Users className="h-4 w-4 text-[#10B981]" />;
      case 'support':
        return <Headphones className="h-4 w-4 text-[#EF4444]" />;
      case 'payments':
        return <DollarSign className="h-4 w-4 text-[#10B981]" />;
      case 'invoices':
        return <FileText className="h-4 w-4 text-[#8B5CF6]" />;
      case 'billing':
        return <CreditCard className="h-4 w-4 text-[#F59E0B]" />;
      default:
        return <Search className="h-4 w-4 text-[#727272]" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'organizations':
        return 'Organizations';
      case 'therapists':
        return 'Therapists';
      case 'users':
        return 'Users';
      case 'support':
        return 'Support Tickets';
      case 'payments':
        return 'Payments';
      case 'invoices':
        return 'Invoices';
      case 'billing':
        return 'Billing';
      default:
        return '';
    }
  };

  const getStatusBadge = (category: string, status?: string) => {
    if (!status) return null;

    let className = 'text-xs';
    switch (status) {
      case 'Active':
        className += ' bg-green-100 text-green-800 border-green-200';
        break;
      case 'Pending':
      case 'Open':
      case 'In Progress':
      case 'Unpaid':
        className += ' bg-yellow-100 text-yellow-800 border-yellow-200';
        break;
      case 'Failed':
      case 'Overdue':
      case 'Action Required':
        className += ' bg-red-100 text-red-800 border-red-200';
        break;
      case 'Completed':
      case 'Paid':
      case 'Resolved':
        className += ' bg-green-100 text-green-800 border-green-200';
        break;
      default:
        className += ' bg-gray-100 text-gray-800 border-gray-200';
    }

    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const categoryOrder = ['organizations', 'therapists', 'users', 'support', 'payments', 'invoices', 'billing'];

  return (
    <div ref={searchRef} className={cn("relative flex-1 max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#727272]" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-[480px] pl-10 pr-20 h-10 border-[#e4e4e4] rounded-full bg-white focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
        />
        {showKeyboardShortcut && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-2 py-1 text-xs font-medium text-[#727272] bg-[#F9F9F9] border border-[#e4e4e4] rounded">
              <Command className="h-3 w-3 inline" />
            </kbd>
            <kbd className="px-2 py-1 text-xs font-medium text-[#727272] bg-[#F9F9F9] border border-[#e4e4e4] rounded">
              K
            </kbd>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-[#e4e4e4] rounded-lg shadow-lg max-h-[600px] overflow-y-auto z-50">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-[#727272]">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </span>
              <span className="text-xs text-[#AFAFAF]">
                Use ↑↓ to navigate, Enter to select
              </span>
            </div>

            {categoryOrder.map((category) => {
              const categoryResults = groupedResults[category];
              if (!categoryResults || categoryResults.length === 0) return null;

              return (
                <div key={category} className="mt-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    {getCategoryIcon(category)}
                    <span className="text-xs font-semibold text-[#727272] uppercase">
                      {getCategoryLabel(category)}
                    </span>
                    <span className="text-xs text-[#AFAFAF]">({categoryResults.length})</span>
                  </div>
                  <div className="space-y-1">
                    {categoryResults.map((result, idx) => {
                      const globalIndex = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className={cn(
                            'w-full text-left px-3 py-3 rounded-md transition-colors',
                            'hover:bg-[#FFF7ED] hover:border-[#F97316]/20',
                            globalIndex === selectedIndex && 'bg-[#FFF7ED] border border-[#F97316]/30'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-black truncate">
                                  {result.title}
                                </p>
                                {getStatusBadge(result.category, result.status)}
                              </div>
                              <p className="text-xs text-[#727272] truncate mb-1">
                                {result.subtitle}
                              </p>
                              {result.metadata && (
                                <p className="text-xs text-[#AFAFAF] truncate">
                                  {result.metadata}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isOpen && value.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-[#e4e4e4] rounded-lg shadow-lg p-8 text-center z-50">
          <Search className="h-12 w-12 mx-auto mb-3 text-[#AFAFAF] opacity-50" />
          <p className="text-sm text-[#727272] mb-1">No results found</p>
          <p className="text-xs text-[#AFAFAF]">
            Try searching for organizations, therapists, users, tickets, or billing information
          </p>
        </div>
      )}
    </div>
  );
}
