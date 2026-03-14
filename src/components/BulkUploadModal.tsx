import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompts: any[]) => Promise<void>;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!jsonContent.trim()) {
        throw new Error('Please provide JSON content.');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(jsonContent);
      } catch (err) {
        throw new Error('Invalid JSON format. Please ensure it is a valid JSON array.');
      }

      if (!Array.isArray(parsedData)) {
        throw new Error('The JSON must be an array of prompt objects.');
      }

      if (parsedData.length === 0) {
        throw new Error('The JSON array is empty.');
      }

      // Basic validation
      for (let i = 0; i < parsedData.length; i++) {
        const p = parsedData[i];
        if (!p.title || !p.description || !p.content || !p.category) {
          throw new Error(`Prompt at index ${i} is missing required fields (title, description, content, or category).`);
        }
      }

      setIsSubmitting(true);
      await onSubmit(parsedData);
      setJsonContent('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during validation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Upload size={20} className="text-accent" />
            Bulk Upload Prompts
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-accent-soft border border-accent/20 rounded-lg text-sm">
          <p className="font-bold text-accent mb-2">Expected JSON Format:</p>
          <pre className="bg-white/50 p-2 rounded text-xs overflow-x-auto">
{`[
  {
    "title": "Example Prompt",
    "description": "A short description of what it does.",
    "content": "The actual prompt text to be copied...",
    "category": "Coding",
    "tags": ["react", "frontend"],
    "tier": "free" // or "pro"
  }
]`}
          </pre>
          <p className="mt-2 text-text-muted">
            You can generate this format using Gemini and paste it below. You can upload 100+ prompts at once.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label>JSON Data</label>
            <textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              placeholder="Paste your JSON array here..."
              className="min-h-[200px] font-mono text-sm"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Prompts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
