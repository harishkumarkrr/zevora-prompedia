import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategorySidebar } from './components/CategorySidebar';
import { PromptCard } from './components/PromptCard';
import { SubmitPromptModal } from './components/SubmitPromptModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { LegalModal } from './components/LegalModal';
import { Prompt } from './types';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ExternalLink, X, Star, MessageSquare, Heart, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORY_GROUPS } from './constants';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, where, orderBy, getDocFromServer, doc, updateDoc, increment, arrayUnion, arrayRemove, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth, handleFirestoreError, OperationType } from './FirebaseProvider';

import { AuthModal } from './components/AuthModal';

const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories);

export default function App() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'refunds' | null>(null);

  const handleBulkUploadSubmit = async (uploadedPrompts: any[]) => {
    if (!user) return;
    
    try {
      // Process in batches of 500 (Firestore limit)
      const batchSize = 500;
      for (let i = 0; i < uploadedPrompts.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = uploadedPrompts.slice(i, i + batchSize);
        
        chunk.forEach((p) => {
          const newDocRef = doc(collection(db, 'prompts'));
          batch.set(newDocRef, {
            title: p.title,
            description: p.description,
            content: p.content,
            category: p.category,
            tags: p.tags || [],
            tier: p.tier || 'free',
            is_public: true,
            author_id: user.uid,
            created_at: new Date().toISOString(),
            slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            rating_count: 0,
            upvoted_by: []
          });
        });
        
        await batch.commit();
      }
      alert(`Successfully uploaded ${uploadedPrompts.length} prompts!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'prompts');
      throw error;
    }
  };

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Fetch prompts from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'prompts'),
      where('is_public', '==', true),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Fetched ${snapshot.docs.length} prompts`);
      const fetchedPrompts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prompt[];
      setPrompts(fetchedPrompts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching prompts:', error);
      handleFirestoreError(error, OperationType.LIST, 'prompts');
      setLoading(false); // Ensure loading is turned off even on error
    });

    return () => unsubscribe();
  }, []);

  // Fetch favorites
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'favorites'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs = snapshot.docs.map(doc => doc.data().prompt_id as string);
      setFavorites(favs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/favorites`);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(p.id);
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [prompts, searchQuery, selectedCategory, showFavoritesOnly, favorites]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignIn = () => {
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const scrollToLibrary = () => {
    const element = document.getElementById('prompt-library');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onAuthClick={handleSignIn}
        onSignOut={handleSignOut}
        onSubmitClick={() => {
          if (!user) {
            handleSignIn();
          } else {
            setIsSubmitModalOpen(true);
          }
        }}
        onBulkUploadClick={() => setIsBulkUploadModalOpen(true)}
        user={user}
      />

      <main className="page">
        <Hero onBrowseClick={scrollToLibrary} />

        <div className="layout-grid" id="prompt-library">
          <CategorySidebar 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
            user={user}
          />

          <div className="flex-1 min-w-0">
            <div className="md:pr-4 pb-4">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display font-bold">
                    {selectedCategory ? `${selectedCategory} Prompts` : 'All Prompts'}
                    <span className="ml-2 text-sm font-normal text-text-muted">
                      ({filteredPrompts.length})
                    </span>
                  </h2>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                  </div>
                ) : (
                  <div className="prompt-grid">
                    {filteredPrompts.map((prompt) => (
                      <PromptCard 
                        key={prompt.id} 
                        prompt={prompt} 
                        isActive={selectedPrompt?.id === prompt.id}
                        isFavorited={favorites.includes(prompt.id)}
                        onClick={() => setSelectedPrompt(prompt)}
                      />
                    ))}
                    
                    {filteredPrompts.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <p className="text-text-muted">No prompts found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedPrompt && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
            >
              <div className="p-6 border-bottom flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="pill">#{selectedPrompt.category}</span>
                    {selectedPrompt.tier === 'pro' && (
                      <span className="bg-accent-soft text-accent text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} fill="currentColor" />
                        PRO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-display font-bold">{selectedPrompt.title}</h2>
                    <button 
                      onClick={async () => {
                        if (!user) {
                          alert('Please sign in to favorite.');
                          return;
                        }
                        
                        const isFavorited = favorites.includes(selectedPrompt.id);
                        const favRef = doc(db, 'users', user.uid, 'favorites', selectedPrompt.id);
                        
                        try {
                          if (isFavorited) {
                            await deleteDoc(favRef);
                          } else {
                            await setDoc(favRef, {
                              prompt_id: selectedPrompt.id,
                              created_at: new Date().toISOString()
                            });
                          }
                        } catch (error) {
                          console.error('Error favoriting prompt:', error);
                          alert('Failed to favorite. Please try again.');
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors group"
                      title={favorites.includes(selectedPrompt.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        size={20} 
                        className={favorites.includes(selectedPrompt.id) 
                          ? "fill-rose-600 text-rose-600" 
                          : "text-text-muted group-hover:text-rose-600"
                        } 
                      />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPrompt(null)}
                  className="p-2 hover:bg-bg rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-8">
                  <h3 className="section-label mb-2">Description</h3>
                  <p className="text-text-muted">{selectedPrompt.description}</p>
                </div>

                <div className="relative group">
                  <div className="section-label mb-2 flex items-center justify-between">
                    <span>Prompt Content</span>
                    <button 
                      onClick={() => handleCopy(selectedPrompt.content)}
                      className="flex items-center gap-2 text-accent hover:text-accent-hover transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {copied ? 'Copied!' : 'Copy Prompt'}
                      </span>
                    </button>
                  </div>
                  <div className="markdown-body bg-panel-muted p-6 rounded-xl border border-border">
                    <ReactMarkdown>{selectedPrompt.content}</ReactMarkdown>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {selectedPrompt.tags.map(tag => (
                    <span key={tag} className="text-xs bg-bg px-2 py-1 rounded text-text-muted font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-bg-2 border-top flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={async () => {
                      if (!user) {
                        alert('Please sign in to upvote.');
                        return;
                      }
                      
                      const hasUpvoted = selectedPrompt.upvoted_by?.includes(user.uid);
                      
                      try {
                        const promptRef = doc(db, 'prompts', selectedPrompt.id);
                        
                        if (hasUpvoted) {
                          await updateDoc(promptRef, {
                            rating_count: increment(-1),
                            upvoted_by: arrayRemove(user.uid)
                          });
                          
                          // Optimistic update
                          setSelectedPrompt(prev => prev ? { 
                            ...prev, 
                            rating_count: Math.max(0, (prev.rating_count || 0) - 1),
                            upvoted_by: prev.upvoted_by?.filter(id => id !== user.uid) || []
                          } : null);
                          setPrompts(prev => prev.map(p => p.id === selectedPrompt.id ? { 
                            ...p, 
                            rating_count: Math.max(0, (p.rating_count || 0) - 1),
                            upvoted_by: p.upvoted_by?.filter(id => id !== user.uid) || []
                          } : p));
                        } else {
                          await updateDoc(promptRef, {
                            rating_count: increment(1),
                            upvoted_by: arrayUnion(user.uid)
                          });
                          
                          // Optimistic update
                          setSelectedPrompt(prev => prev ? { 
                            ...prev, 
                            rating_count: (prev.rating_count || 0) + 1,
                            upvoted_by: [...(prev.upvoted_by || []), user.uid]
                          } : null);
                          setPrompts(prev => prev.map(p => p.id === selectedPrompt.id ? { 
                            ...p, 
                            rating_count: (p.rating_count || 0) + 1,
                            upvoted_by: [...(p.upvoted_by || []), user.uid]
                          } : p));
                        }
                      } catch (error) {
                        console.error('Error upvoting prompt:', error);
                        alert('Failed to upvote. Please try again.');
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-accent transition-colors"
                  >
                    <Star size={18} className={selectedPrompt.upvoted_by?.includes(user?.uid || '') ? "fill-accent text-accent" : ""} />
                    <span>{selectedPrompt.rating_count ? `Upvoted (${selectedPrompt.rating_count})` : 'Upvote'}</span>
                  </button>
                </div>
                <button 
                  onClick={() => {
                    handleCopy(selectedPrompt.content);
                    window.open('https://aistudio.google.com/app/prompts/new_chat', '_blank');
                  }}
                  className="chip active px-6 py-2 flex items-center gap-2 bg-accent text-white hover:bg-accent-hover"
                >
                  <Zap size={16} fill="currentColor" />
                  <span>Try it in Gemini AI Studio</span>
                  <ExternalLink size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SubmitPromptModal 
        isOpen={isSubmitModalOpen} 
        onClose={() => setIsSubmitModalOpen(false)} 
        userId={user?.uid || ''}
      />

      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSubmit={handleBulkUploadSubmit}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <footer className="mt-20 py-12 border-t border-border bg-panel">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img 
              src="/brand-logo.png" 
              alt="Zevora Logo" 
              width="40"
              height="40"
              className="object-contain" 
            />
            <span className="font-display font-bold text-xl tracking-tight">zevora</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-text-muted">
            <button onClick={() => setLegalModalType('privacy')} className="hover:text-accent transition-colors">Privacy Policy</button>
            <button onClick={() => setLegalModalType('terms')} className="hover:text-accent transition-colors">Terms of Service</button>
            <button onClick={() => setLegalModalType('refunds')} className="hover:text-accent transition-colors">Refund Policy</button>
            <a href="mailto:support@zevora.xyz" className="hover:text-accent transition-colors">Contact Support</a>
          </div>
          <p className="text-sm text-text-muted/60">
            &copy; {new Date().getFullYear()} Zevora. All rights reserved.
          </p>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModalType !== null}
        onClose={() => setLegalModalType(null)}
        title={
          legalModalType === 'privacy' ? 'Privacy Policy' :
          legalModalType === 'terms' ? 'Terms of Service' :
          'Refund Policy'
        }
        content={
          legalModalType === 'privacy' ? (
            <div className="space-y-4 text-text-muted">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">1. Information We Collect</h3>
              <p>We collect information you provide directly to us when you create an account, submit prompts, or communicate with us. This may include your name, email address, and any content you submit.</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">2. How We Use Your Information</h3>
              <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience on Zevora.</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">3. Information Sharing</h3>
              <p>We do not share your personal information with third parties except as described in this privacy policy or with your consent. Prompts you submit as "public" will be visible to all users.</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">4. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at support@zevora.xyz.</p>
            </div>
          ) : legalModalType === 'terms' ? (
            <div className="space-y-4 text-text-muted">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">1. Acceptance of Terms</h3>
              <p>By accessing or using Zevora, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">2. User Content</h3>
              <p>You retain all rights to the prompts you submit. By submitting public prompts, you grant Zevora a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content within the platform.</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">3. Acceptable Use</h3>
              <p>You agree not to use the service to submit malicious, illegal, or highly offensive content. We reserve the right to remove any content or terminate accounts that violate these terms.</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">4. Disclaimer</h3>
              <p>The materials on Zevora are provided on an 'as is' basis. Zevora makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
            </div>
          ) : (
            <div className="space-y-4 text-text-muted">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">1. Refund Eligibility</h3>
              <p>We want you to be satisfied with your Zevora Pro subscription. If you are not completely satisfied, you may request a refund within 14 days of your initial purchase.</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">2. How to Request a Refund</h3>
              <p>To request a refund, please contact us at support@zevora.xyz with your account email and the reason for your request. We process refund requests within 5-7 business days.</p>
              <h3 className="text-lg font-bold text-text mt-6 mb-2">3. Exceptions</h3>
              <p>Refunds are generally not provided for renewal payments or after the 14-day window has passed. Accounts terminated for violating our Terms of Service are not eligible for refunds.</p>
            </div>
          )
        }
      />
    </div>
  );
}
