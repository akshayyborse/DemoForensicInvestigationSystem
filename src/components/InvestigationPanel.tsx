import { useState } from 'react';
import { Plus, Folder, Loader2 } from 'lucide-react';
import { supabase, Investigation } from '../lib/supabase';

interface InvestigationPanelProps {
  onInvestigationCreated: (investigation: Investigation) => void;
  currentInvestigation: Investigation | null;
}

export function InvestigationPanel({
  onInvestigationCreated,
  currentInvestigation,
}: InvestigationPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    investigator: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.investigator) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investigations')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            investigator: formData.investigator,
            status: 'open',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onInvestigationCreated(data);
        setFormData({ title: '', description: '', investigator: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating investigation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Investigation</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        )}
      </div>

      {currentInvestigation && !showForm ? (
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Title
            </span>
            <p className="text-sm text-gray-900 mt-1">{currentInvestigation.title}</p>
          </div>
          {currentInvestigation.description && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Description
              </span>
              <p className="text-sm text-gray-600 mt-1">{currentInvestigation.description}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Investigator
            </span>
            <p className="text-sm text-gray-900 mt-1">{currentInvestigation.investigator}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Status
            </span>
            <p className="text-sm mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {currentInvestigation.status}
              </span>
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Created
            </span>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(currentInvestigation.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ) : showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Security Breach Investigation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed investigation description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investigator *
            </label>
            <input
              type="text"
              value={formData.investigator}
              onChange={(e) => setFormData({ ...formData, investigator: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Investigation'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No investigation selected. Create a new one to get started.
        </p>
      )}
    </div>
  );
}
