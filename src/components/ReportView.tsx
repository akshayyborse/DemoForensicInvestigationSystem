import { useState } from 'react';
import { FileText, Download, Eye, EyeOff } from 'lucide-react';

interface ReportViewProps {
  report: {
    format: string;
    content: string;
    methodology: string;
    evidenceIntegrity: string;
  };
}

export function ReportView({ report }: ReportViewProps) {
  const [showRaw, setShowRaw] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic-report-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Forensic Report</h2>
              <p className="text-gray-300 text-sm mt-1">
                Format: {report.format.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {showRaw ? (
                <>
                  <Eye className="w-4 h-4" />
                  Formatted
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Raw
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {showRaw ? (
          <pre className="text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto border border-gray-200">
            {report.content}
          </pre>
        ) : (
          <div className="prose max-w-none">
            {report.content.split('\n').map((line, idx) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-2xl font-bold text-gray-900 mt-6 mb-4">
                    {line.substring(2)}
                  </h1>
                );
              } else if (line.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                    {line.substring(3)}
                  </h2>
                );
              } else if (line.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-lg font-semibold text-gray-700 mt-4 mb-2">
                    {line.substring(4)}
                  </h3>
                );
              } else if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <p key={idx} className="font-semibold text-gray-900 my-2">
                    {line.slice(2, -2)}
                  </p>
                );
              } else if (line.startsWith('---')) {
                return <hr key={idx} className="my-6 border-gray-300" />;
              } else if (line.startsWith('|')) {
                return null;
              } else if (line.trim() === '') {
                return <br key={idx} />;
              } else {
                const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return (
                  <p
                    key={idx}
                    className="text-gray-700 my-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: processedLine }}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
