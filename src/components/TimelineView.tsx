import { CorrelatedTimeline } from '../lib/timelineGenerator';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface TimelineViewProps {
  timeline: CorrelatedTimeline;
}

export function TimelineView({ timeline }: TimelineViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">{timeline.title}</h2>
        <p className="text-blue-100 text-sm">
          Correlated analysis of {timeline.events.length} events
        </p>
      </div>

      {timeline.patterns.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-2">
                Detected Patterns ({timeline.patterns.length})
              </h3>
              <ul className="space-y-1">
                {timeline.patterns.map((pattern, idx) => (
                  <li key={idx} className="text-sm text-amber-800">
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {timeline.narrative}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>
            Timeline analysis complete. {timeline.events.length} events correlated,{' '}
            {timeline.patterns.length} patterns identified.
          </span>
        </div>
      </div>
    </div>
  );
}
