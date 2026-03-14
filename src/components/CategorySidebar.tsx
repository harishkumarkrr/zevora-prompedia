import React from 'react';
import { CATEGORY_GROUPS } from '../constants';
import { ChevronDown, Heart } from 'lucide-react';

interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  showFavoritesOnly?: boolean;
  onToggleFavorites?: () => void;
  user?: any;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
  selectedCategory, 
  onSelectCategory,
  showFavoritesOnly,
  onToggleFavorites,
  user
}) => {
  return (
    <div className="sidebar">
      <div className="panel">
        <div className="panel-header">
          <h2>Categories</h2>
          <button 
            className="text-xs text-accent font-bold"
            onClick={() => onSelectCategory(null)}
          >
            Clear
          </button>
        </div>
        
        {user && onToggleFavorites && (
          <div className="px-4 pb-4 border-b border-border mb-4">
            <button
              onClick={onToggleFavorites}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                showFavoritesOnly 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                  : 'bg-bg hover:bg-bg-2 text-text-muted border border-transparent'
              }`}
            >
              <Heart size={16} className={showFavoritesOnly ? "fill-rose-600" : ""} />
              My Favorites
            </button>
          </div>
        )}

        <div className="category-groups">
          {CATEGORY_GROUPS.map((group) => (
            <details key={group.name} className="category-group" open>
              <summary>
                <span>{group.name}</span>
                <ChevronDown size={14} className="group-caret" />
              </summary>
              <div className="category-list">
                {group.categories.map((cat) => (
                  <button
                    key={cat}
                    className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => onSelectCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};
