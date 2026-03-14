import React, { useState } from 'react';
import { Heart, Search } from 'lucide-react';

interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  showFavoritesOnly?: boolean;
  onToggleFavorites?: () => void;
  user?: any;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
  categories,
  selectedCategory, 
  onSelectCategory,
  showFavoritesOnly,
  onToggleFavorites,
  user
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="panel">
        <div className="panel-header">
          <h2>Categories</h2>
        </div>
        
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text"
              placeholder="Filter categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-bg-2 rounded-lg text-sm border border-border focus:border-accent outline-none transition-colors"
            />
          </div>
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

        <div className="category-list p-4 flex flex-col gap-1">
          <button
            className={`category-item text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-accent-soft text-accent' : 'hover:bg-bg-2 text-text-muted'}`}
            onClick={() => onSelectCategory(null)}
          >
            All
          </button>
          {filteredCategories.map((cat) => (
            <button
              key={cat}
              className={`category-item text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-accent-soft text-accent' : 'hover:bg-bg-2 text-text-muted'}`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
