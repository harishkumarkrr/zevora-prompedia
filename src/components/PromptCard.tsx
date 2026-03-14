import React from 'react';
import { Zap, Copy, ExternalLink, Star, ArrowRight, Heart } from 'lucide-react';
import { Prompt } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PromptCardProps {
  prompt: Prompt;
  isActive: boolean;
  isFavorited?: boolean;
  onClick: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, isActive, isFavorited, onClick }) => {
  return (
    <div 
      className={cn(
        "prompt-card",
        isActive && "active"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start w-full gap-2">
        <h3 className="prompt-title flex items-center gap-2 flex-wrap">
          {prompt.title}
          {prompt.tier === 'pro' && (
            <div className="inline-flex items-center gap-1 bg-accent text-white text-[0.625rem] font-bold px-2 py-1 rounded">
              <Zap size={10} fill="currentColor" />
              PRO
            </div>
          )}
        </h3>
        <div className="flex items-center gap-3 shrink-0">
          {isFavorited && (
            <Heart size={14} className="fill-rose-500 text-rose-500" />
          )}
          {prompt.rating_count !== undefined && (
            <div className="flex items-center gap-1 text-xs font-bold text-accent">
              <Star size={12} fill="currentColor" />
              {prompt.rating_count}
            </div>
          )}
        </div>
      </div>
      
      <p className="prompt-snippet">
        {prompt.description}
      </p>
      
      <div className="mt-auto pt-2 flex items-center gap-2">
        <span className="pill">#{prompt.category}</span>
      </div>

      <div className="hover-preview">
        <div className="preview-label">Quick Preview</div>
        <div className="preview-content">
          {prompt.content}
        </div>
      </div>
    </div>
  );
};
