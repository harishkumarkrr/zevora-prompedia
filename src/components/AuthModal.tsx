import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, CheckCircle2, ArrowLeft } from 'lucide-react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  AuthError
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'verification-sent';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getFriendlyErrorMessage = (error: AuthError) => {
    switch (error.code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (view === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setError('Your email is not verified. Please check your inbox or click below to resend.');
          await auth.signOut();
          setLoading(false);
          return;
        }
      } else if (view === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        await sendEmailVerification(userCredential.user);
        await auth.signOut();
        setView('verification-sent');
        setLoading(false);
        return;
      } else if (view === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset link sent! Please check your email.');
        setLoading(false);
        return;
      }
      onClose();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      // To resend, we temporarily sign in (if we have credentials) or just tell them to check again
      // Actually, Firebase requires a logged-in user to resend. 
      // Since we signed them out, we'd need them to log in again, but we block login for unverified.
      // Better approach: Tell them to check spam or contact support if they can't find it.
      // Or, we can try to sign in again just to resend.
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await auth.signOut();
      setSuccess('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      setError('Could not resend verification. Please ensure your credentials are correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    }
  };

  if (view === 'verification-sent') {
    return (
      <div className="modal-overlay">
        <div className="modal-content max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={40} />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Verify your email</h2>
          <p className="text-text-muted mb-6">
            We've sent a verification link to <span className="font-bold text-text">{email}</span>. 
            Please check your inbox and click the link to activate your account.
          </p>
          <button
            onClick={() => {
              setView('login');
            }}
            className="w-full py-3 bg-accent text-white rounded-lg font-bold hover:bg-accent-hover transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md w-full">
        <div className="p-6 border-bottom flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {view !== 'login' && view !== 'signup' && (
              <button onClick={() => setView('login')} className="p-1 hover:bg-bg rounded-full">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-display font-bold">
              {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-bg rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100">
              {error}
              {error.includes('not verified') && (
                <button 
                  onClick={handleResendVerification}
                  className="block mt-2 font-bold underline"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100">
              {success}
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {view === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-text mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-text mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {view !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-text">Password</label>
                  {view === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-xs font-bold text-accent hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-accent text-white rounded-lg font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Please wait...' : (view === 'login' ? 'Sign In' : view === 'signup' ? 'Sign Up' : 'Send Reset Link')}
            </button>
          </form>

          {view !== 'forgot-password' && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-text-muted font-medium">OR</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2 bg-white border border-border text-text rounded-lg font-bold hover:bg-bg transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="mt-6 text-center text-sm text-text-muted">
            {view === 'login' ? "Don't have an account? " : view === 'signup' ? "Already have an account? " : ""}
            <button 
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="text-accent font-bold hover:underline"
            >
              {view === 'login' ? 'Sign Up' : (view === 'signup' || view === 'forgot-password' ? 'Sign In' : '')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
