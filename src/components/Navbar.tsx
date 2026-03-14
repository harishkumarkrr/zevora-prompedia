import React, { useState } from 'react';
import { Search, Plus, User, Zap, LogOut, Upload } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAuthClick: () => void;
  onSignOut: () => void;
  onSubmitClick: () => void;
  onBulkUploadClick?: () => void;
  user: any;
}

export const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery, onAuthClick, onSignOut, onSubmitClick, onBulkUploadClick, user }) => {
  const isAdmin = user?.email?.toLowerCase() === 'harishkumarkrr.t@gmail.com';

  return (
    <nav className="topbar">
      <div className="topbar-inner">
        <div className="flex items-center gap-2">
          <div className="brand-name compact">zevora</div>
        </div>

        <div className="topbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="topbar-actions">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button 
                onClick={onBulkUploadClick}
                className="chip flex items-center gap-2 bg-indigo-50 border-indigo-200 text-indigo-700"
                title="Bulk Upload Prompts"
              >
                <Upload size={16} />
                <span>Bulk Upload</span>
              </button>
            </div>
          )}

          <button 
            onClick={onSubmitClick}
            className="chip flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Submit</span>
          </button>
          
          <button 
            className="chip flex items-center gap-2 opacity-50 cursor-not-allowed"
            title="Coming Soon"
          >
            <Zap size={16} className="text-accent" fill="currentColor" />
            <span>Community</span>
          </button>
          
          {user ? (
            <div className="relative group">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-9 rounded-full border-2 border-accent/20 overflow-hidden bg-accent-soft flex items-center justify-center text-accent font-bold shadow-sm">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{user.email?.[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
              
              <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                <div className="bg-panel border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-text truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-text-muted truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-muted">Current Plan</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent/10 text-accent uppercase tracking-wider">
                        {user.email?.toLowerCase() === 'harishkumarkrr.t@gmail.com' ? 'Admin' : 'Free'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={onSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="chip active flex items-center gap-2"
            >
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
