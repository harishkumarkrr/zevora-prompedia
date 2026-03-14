import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Prompt } from '../types';
import { CATEGORY_GROUPS } from '../constants';
import { handleFirestoreError, OperationType } from '../FirebaseProvider';

interface SubmitPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const SubmitPromptModal: React.FC<SubmitPromptModalProps> = ({ isOpen, onClose, userId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const allCategories = CATEGORY_GROUPS.flatMap(g => g.categories);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category) return;

    setIsSubmitting(true);
    try {
      const newPrompt = {
        title,
        description,
        content,
        category,
        tags: [],
        tier: 'free',
        is_public: true,
        author_id: userId,
        created_at: new Date().toISOString(),
        slug: title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
        rating_count: 0
      };

      await addDoc(collection(db, 'prompts'), newPrompt);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setTitle('');
        setDescription('');
        setContent('');
        setCategory('');
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'prompts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="modal-content"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">
                {success ? 'Success!' : 'Submit a Prompt'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {success ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <Send size={32} />
                </div>
                <h3 className="text-xl font-bold">Prompt Submitted!</h3>
                <p className="text-text-muted">Your prompt has been added to the library.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="e.g., Creative Storyteller"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-muted mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-accent/20 outline-none bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-muted mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-accent/20 outline-none h-20 resize-none"
                  placeholder="Briefly describe what this prompt does..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-muted mb-1">Prompt Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-accent/20 outline-none h-40 font-mono text-sm"
                  placeholder="Paste your prompt here..."
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full chip active py-3 flex items-center justify-center gap-2 text-base"
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      <span>Submit Prompt</span>
                      <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
