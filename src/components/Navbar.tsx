import React, { useState } from 'react';
import { Search, Plus, User, Zap, Database, LogOut, Library, Trash2, Upload, Sparkles } from 'lucide-react';
import { migrateData } from '../migrate';
import { removePlaceholderPrompts, cleanDuplicates, seedDatabase } from '../seedData';

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
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const isAdmin = user?.email?.toLowerCase() === 'harishkumarkrr.t@gmail.com';

  const handleSeedData = async () => {
    setIsSeedingData(true);
    setMigrationStatus('Seeding data...');
    try {
      const count = await seedDatabase();
      setMigrationStatus(`Successfully seeded ${count} prompts!`);
      setTimeout(() => setMigrationStatus(null), 10000);
    } catch (error) {
      setMigrationStatus('Seeding failed.');
      console.error('Seeding error:', error);
    } finally {
      setIsSeedingData(false);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    setMigrationStatus('Starting migration...');
    try {
      const count = await migrateData();
      setMigrationStatus(`Successfully migrated ${count} prompts!`);
      setTimeout(() => setMigrationStatus(null), 10000);
    } catch (error) {
      setMigrationStatus(error instanceof Error ? error.message : 'Migration failed.');
      console.error('Migration error:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCleanPlaceholders = async () => {
    setIsSeeding(true);
    setMigrationStatus('Cleaning placeholders...');
    try {
      const count = await removePlaceholderPrompts();
      setMigrationStatus(`Successfully deleted ${count} placeholders!`);
      setTimeout(() => setMigrationStatus(null), 10000);
    } catch (error) {
      setMigrationStatus('Cleanup failed.');
      console.error('Cleanup error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClean = async () => {
    setIsCleaning(true);
    setMigrationStatus('Cleaning duplicates...');
    console.log('Starting duplicate cleanup process...');
    try {
      const count = await cleanDuplicates();
      console.log(`Cleanup successful. Deleted ${count} duplicates.`);
      setMigrationStatus(`Successfully deleted ${count} duplicates!`);
      setTimeout(() => setMigrationStatus(null), 10000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cleanup failed.';
      setMigrationStatus(message);
      console.error('Cleanup error:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <nav className="topbar">
      <div className="topbar-inner">
        <div className="flex items-center gap-2">
          <img 
            src={`${window.location.origin}/zevora-logo-v3.png`} 
            alt="Zevora Logo" 
            width="32"
            height="32"
            className="object-contain" 
          />
          <div className="brand-name compact">zevora</div>
          {migrationStatus && (
            <div className="ml-4 px-3 py-1 rounded-lg bg-accent/10 text-accent text-xs font-bold animate-pulse">
              {migrationStatus}
            </div>
          )}
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
                onClick={handleMigrate}
                disabled={isMigrating}
                className="chip flex items-center gap-2 bg-amber-50 border-amber-200 text-amber-700"
                title="Migrate from Supabase"
              >
                <Database size={16} />
                <span>{isMigrating ? 'Migrating...' : 'Migrate'}</span>
              </button>
              <button 
                onClick={handleCleanPlaceholders}
                disabled={isSeeding}
                className="chip flex items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-700"
                title="Remove Placeholder Prompts"
              >
                <Library size={16} />
                <span>{isSeeding ? 'Cleaning...' : 'Clean Placeholders'}</span>
              </button>
              <button 
                onClick={handleClean}
                disabled={isCleaning}
                className="chip flex items-center gap-2 bg-rose-50 border-rose-200 text-rose-700"
                title="Remove Duplicate Prompts"
              >
                <Trash2 size={16} />
                <span>{isCleaning ? 'Cleaning...' : 'Clean Duplicates'}</span>
              </button>
              <button 
                onClick={handleSeedData}
                disabled={isSeedingData}
                className="chip flex items-center gap-2 bg-cyan-50 border-cyan-200 text-cyan-700"
                title="Seed Initial Data"
              >
                <Sparkles size={16} />
                <span>{isSeedingData ? 'Seeding...' : 'Seed Data'}</span>
              </button>
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
