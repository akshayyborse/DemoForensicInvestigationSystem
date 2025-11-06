import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { executeNaturalLanguageQuery } from '../lib/nlQueryParser';
import { supabase, ForensicEvent } from '../lib/supabase';

interface QueryInterfaceProps {
  onResults: (events: ForensicEvent[], query: string, sql: string) => void;
}

export function QueryInterface({ onResults }: QueryInterfaceProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [examples] = useState([
    'Show me all login attempts from outside the US between 2 AM and 4 AM that resulted in a successful file download',
    'Find all failed login attempts from Russia',
    'Show successful file downloads in the last 24 hours',
    'List all events from IP address 185.220.101.5',
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { events, sqlQuery } = await executeNaturalLanguageQuery(query, supabase);
      onResults(events as ForensicEvent[], query, sqlQuery);
    } catch (error) {
      console.error('Query error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Natural Language Query</h2>
        <p className="text-sm text-gray-600">
          Ask questions in plain English to search forensic events
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me all login attempts from Russia..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Example Queries:</h3>
        <div className="space-y-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(example)}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
