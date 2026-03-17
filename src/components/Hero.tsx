import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';

interface HeroProps {
  onBrowseClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBrowseClick }) => {
  const [showInfo, setShowInfo] = React.useState(false);

  return (
    <div className="hero">
      <div className="flex-1">
        <div className="eyebrow mb-0.5">Prompt Library</div>
        <h1 className="font-display">Don't just type. <br /><span className="text-accent">Prompt smarter.</span></h1>
        <p className="subtitle mb-0">
          Zevora is a public prompt library with ready-to-use examples for AI models. 
          Browse, search, and contribute prompt templates to the community.
        </p>
        
        <div className="hero-buttons mt-3">
          <button 
            onClick={onBrowseClick}
            className="chip active px-5 py-2.5 text-sm flex items-center gap-2"
          >
            Browse Library
            <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="chip px-5 py-2.5 text-sm flex items-center gap-2"
          >
            How it works
          </button>
        </div>

        {showInfo && (
          <div className="mt-6 p-4 bg-accent-soft rounded-xl border border-accent/10 animate-fade-in">
            <p className="text-sm font-medium text-accent">
              Browse prompts, copy them, and use them in your favorite AI models! 
              You can also submit your own prompts to help the community grow.
            </p>
          </div>
        )}
      </div>
      
      <div className="hidden lg:flex flex-col items-end gap-1">
      </div>
    </div>
  );
};
