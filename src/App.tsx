import { useState } from 'react';
import { Shield, FileText, GitBranch, Loader2 } from 'lucide-react';
import { QueryInterface } from './components/QueryInterface';
import { EventsTable } from './components/EventsTable';
import { TimelineView } from './components/TimelineView';
import { ReportView } from './components/ReportView';
import { InvestigationPanel } from './components/InvestigationPanel';
import { ForensicEvent, Investigation, supabase } from './lib/supabase';
import { correlateEvents, CorrelatedTimeline } from './lib/timelineGenerator';
import { generateForensicReport } from './lib/reportGenerator';

type View = 'events' | 'timeline' | 'report';

function App() {
  const [events, setEvents] = useState<ForensicEvent[]>([]);
  const [query, setQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [timeline, setTimeline] = useState<CorrelatedTimeline | null>(null);
  const [report, setReport] = useState<any>(null);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [view, setView] = useState<View>('events');
  const [generating, setGenerating] = useState(false);

  const handleQueryResults = async (
    results: ForensicEvent[],
    naturalQuery: string,
    sql: string
  ) => {
    setEvents(results);
    setQuery(naturalQuery);
    setSqlQuery(sql);
    setView('events');

    if (investigation) {
      await supabase.from('queries').insert([
        {
          investigation_id: investigation.id,
          natural_language: naturalQuery,
          sql_query: sql,
          results_count: results.length,
        },
      ]);
    }
  };

  const handleGenerateTimeline = async () => {
    if (events.length === 0) return;

    setGenerating(true);
    try {
      const correlatedTimeline = correlateEvents(events);
      setTimeline(correlatedTimeline);
      setView('timeline');

      if (investigation) {
        await supabase.from('timelines').insert([
          {
            investigation_id: investigation.id,
            title: correlatedTimeline.title,
            event_ids: correlatedTimeline.events.map((e) => e.id),
            narrative: correlatedTimeline.narrative,
          },
        ]);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!timeline || !investigation) return;

    setGenerating(true);
    try {
      const forensicReport = generateForensicReport(investigation, timeline, events);
      setReport(forensicReport);
      setView('report');

      await supabase.from('reports').insert([
        {
          investigation_id: investigation.id,
          format: forensicReport.format,
          content: forensicReport.content,
          methodology: forensicReport.methodology,
          evidence_integrity: forensicReport.evidenceIntegrity,
        },
      ]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Forensic Investigation System</h1>
                <p className="text-sm text-gray-600">Natural Language Query & Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <InvestigationPanel
              onInvestigationCreated={setInvestigation}
              currentInvestigation={investigation}
            />
          </div>
          <div className="lg:col-span-3">
            <QueryInterface onResults={handleQueryResults} />
          </div>
        </div>

        {events.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setView('events')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === 'events'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Events ({events.length})
                </button>
                <button
                  onClick={() => setView('timeline')}
                  disabled={!timeline}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    view === 'timeline'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <GitBranch className="w-4 h-4 inline mr-1.5" />
                  Timeline
                </button>
                <button
                  onClick={() => setView('report')}
                  disabled={!report}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    view === 'report'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Report
                </button>
              </div>
              <div className="flex gap-2">
                {!timeline && (
                  <button
                    onClick={handleGenerateTimeline}
                    disabled={generating || !investigation}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <GitBranch className="w-4 h-4" />
                        Generate Timeline
                      </>
                    )}
                  </button>
                )}
                {timeline && !report && (
                  <button
                    onClick={handleGenerateReport}
                    disabled={generating || !investigation}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate Report
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {view === 'events' && (
              <EventsTable events={events} query={query} sqlQuery={sqlQuery} />
            )}
            {view === 'timeline' && timeline && <TimelineView timeline={timeline} />}
            {view === 'report' && report && <ReportView report={report} />}
          </div>
        )}

        {!investigation && events.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to the Forensic Investigation System
            </h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Create an investigation and start querying security events using natural language.
              The system will help you correlate events, generate timelines, and produce
              comprehensive forensic reports.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Query Events</h4>
                <p className="text-sm text-gray-600">
                  Use natural language to search and filter security events
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Correlate Timeline</h4>
                <p className="text-sm text-gray-600">
                  Automatically correlate events into a narrative timeline
                </p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-3">
                  <span className="text-gray-900 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-white mb-1">Generate Report</h4>
                <p className="text-sm text-gray-300">
                  Create a comprehensive forensic report in legal format
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
