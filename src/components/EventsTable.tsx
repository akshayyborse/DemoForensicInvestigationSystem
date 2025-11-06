import { Clock, User, Globe, Shield, CheckCircle, XCircle } from 'lucide-react';
import { ForensicEvent } from '../lib/supabase';

interface EventsTableProps {
  events: ForensicEvent[];
  query?: string;
  sqlQuery?: string;
}

export function EventsTable({ events, query, sqlQuery }: EventsTableProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No events found. Try a different query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {query && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Query Results</h3>
              <p className="text-sm text-gray-600 mb-2">{query}</p>
              {sqlQuery && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                    View SQL Query
                  </summary>
                  <code className="block mt-2 p-2 bg-white rounded border border-gray-200 text-gray-700">
                    {sqlQuery}
                  </code>
                </details>
              )}
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {events.length} {events.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {event.event_type}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <User className="w-4 h-4 text-gray-400" />
                    {event.user_id || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Globe className="w-4 h-4 text-gray-400" />
                      {event.country || 'Unknown'}
                    </div>
                    {event.ip_address && (
                      <span className="text-xs text-gray-500">{event.ip_address}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-900">{event.action}</span>
                    {event.resource && (
                      <span className="text-xs text-gray-500">{event.resource}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {event.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        event.status === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
