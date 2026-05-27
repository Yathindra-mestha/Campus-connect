import React, { useEffect, useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENV_CONFIG } from '../src/constants/config';
import { doc, setDoc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, User, Sparkles, ChevronLeft } from 'lucide-react';

// Declaration for google accounts id
declare global {
    interface Window {
        google: any;
    }
}

interface GoogleLoginProps {
    clientId: string;
    onLoginSuccess: (userData: any) => void;
    onLoginFailure?: (error: any) => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ clientId, onLoginSuccess, onLoginFailure }) => {
    const navigate = useNavigate();
    const buttonId = `google-signin-button-${useId().replace(/:/g, '')}`;

    // Handle Onboarding wizard state
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
    
    // Step 1: Favorite Name state
    const [favoriteNameInput, setFavoriteNameInput] = useState('');
    const [favoriteNameError, setFavoriteNameError] = useState('');

    // Step 2: Unique Handle state
    const [usernameInput, setUsernameInput] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [usernameSuccess, setUsernameSuccess] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    
    const [isSaving, setIsSaving] = useState(false);
    const [pendingUserInfo, setPendingUserInfo] = useState<any>(null);

    const decodeJWT = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };

    // Step 1: Name Validation Check
    useEffect(() => {
        if (showUsernameModal && onboardingStep === 1) {
            if (!favoriteNameInput.trim()) {
                setFavoriteNameError('Favorite name cannot be empty.');
            } else if (favoriteNameInput.trim().length < 2) {
                setFavoriteNameError('Name must be at least 2 characters.');
            } else if (favoriteNameInput.trim().length > 30) {
                setFavoriteNameError('Name must be 30 characters or less.');
            } else {
                setFavoriteNameError('');
            }
        }
    }, [favoriteNameInput, showUsernameModal, onboardingStep]);

    // Step 2: Live Username Validation Check
    useEffect(() => {
        if (!usernameInput) {
            setUsernameError('');
            setUsernameSuccess('');
            return;
        }

        const validFormat = /^[a-zA-Z0-9_-]{3,15}$/;
        if (!validFormat.test(usernameInput)) {
            setUsernameError('Must be 3-15 alphanumeric characters, hyphens or underscores.');
            setUsernameSuccess('');
            return;
        }

        // Clean errors while querying
        setUsernameError('');
        setUsernameSuccess('');
        setIsCheckingUsername(true);

        const checkAvailability = setTimeout(async () => {
            try {
                const userDocRef = doc(db, 'users', usernameInput.toLowerCase().trim());
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUsernameError('This username is already taken.');
                    setUsernameSuccess('');
                } else {
                    setUsernameError('');
                    setUsernameSuccess('Username is available!');
                }
            } catch (e) {
                console.error('Failed to verify username uniqueness:', e);
            } finally {
                setIsCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(checkAvailability);
    }, [usernameInput]);

    const handleCredentialResponse = async (response: any) => {
        const userData = decodeJWT(response.credential);
        if (userData) {
            const tempLogin = userData.email.split('@')[0] || userData.name.toLowerCase().replace(/\s+/g, '');
            const userInfo: any = {
                id: userData.sub || userData.email,
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                login: tempLogin.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                avatar_url: userData.picture,
                branch: 'Computer Science • CSE', // Default mock branch
                linkedin_url: '',
                github_url: `https://github.com/${tempLogin}`
            };

            // Query by email to see if they're a returning user
            try {
                const q = query(collection(db, 'users'), where('email', '==', userData.email), limit(1));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // Returning User! Load cloud profile details into session
                    const existingDoc = querySnapshot.docs[0];
                    const existingData = existingDoc.data();

                    userInfo.login = existingDoc.id;
                    if (existingData.name) userInfo.name = existingData.name;
                    if (existingData.branch) userInfo.branch = existingData.branch;
                    if (existingData.bio) userInfo.bio = existingData.bio;
                    if (existingData.location) userInfo.location = existingData.location;
                    if (existingData.avatar_url) userInfo.avatar_url = existingData.avatar_url;

                    localStorage.setItem('googleUser', JSON.stringify(userInfo));

                    // Sync local storage map
                    if (typeof window !== 'undefined') {
                        const localUsersStr = localStorage.getItem('campusconnect_users') || '{}';
                        const localUsers = JSON.parse(localUsersStr);
                        localUsers[userInfo.id] = userInfo;
                        localStorage.setItem('campusconnect_users', JSON.stringify(localUsers));
                    }

                    onLoginSuccess(userInfo);
                    navigate('/profile');
                } else {
                    // New User! Force favorite name & handle selection onboarding modal
                    setPendingUserInfo(userInfo);
                    setFavoriteNameInput(userInfo.name || '');
                    setUsernameInput(userInfo.login); // Pre-fill with email slug
                    setOnboardingStep(1);
                    setShowUsernameModal(true);
                }
            } catch (e) {
                console.error('Failed email-query sync on login:', e);
                // Fallback to pre-fill onboarding handle just in case query fails
                setPendingUserInfo(userInfo);
                setFavoriteNameInput(userInfo.name || '');
                setUsernameInput(userInfo.login);
                setOnboardingStep(1);
                setShowUsernameModal(true);
            }
        } else {
            if (onLoginFailure) onLoginFailure('Failed to decode user data');
        }
    };

    const handleConfirmUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usernameSuccess || isCheckingUsername || isSaving || !pendingUserInfo || favoriteNameError) return;

        setIsSaving(true);
        const finalUsername = usernameInput.toLowerCase().trim();
        const finalFavoriteName = favoriteNameInput.trim();

        try {
            // Write new user details to Firestore 'users' collection under final handle key
            const userDocRef = doc(db, 'users', finalUsername);
            const userProfile = {
                id: pendingUserInfo.id,
                login: finalUsername,
                name: finalFavoriteName,
                email: pendingUserInfo.email,
                avatar_url: pendingUserInfo.avatar_url,
                branch: pendingUserInfo.branch || 'Computer Science • CSE',
                bio: '',
                location: '',
                created_at: new Date().toISOString(),
                last_active_at: new Date().toISOString()
            };

            await setDoc(userDocRef, userProfile);

            const completeUserInfo = {
                ...pendingUserInfo,
                name: finalFavoriteName,
                login: finalUsername,
                github_url: `https://github.com/${finalUsername}`
            };

            localStorage.setItem('googleUser', JSON.stringify(completeUserInfo));

            // Sync user details to local users registry map
            if (typeof window !== 'undefined') {
                const localUsersStr = localStorage.getItem('campusconnect_users') || '{}';
                const localUsers = JSON.parse(localUsersStr);
                localUsers[completeUserInfo.id] = completeUserInfo;
                localStorage.setItem('campusconnect_users', JSON.stringify(localUsers));
            }

            setShowUsernameModal(false);
            onLoginSuccess(completeUserInfo);
            navigate('/profile');
        } catch (error: any) {
            console.error('Failed to save onboarded user handle:', error);
            setUsernameError(`Failed to save account: ${error.message || 'Error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                const buttonElement = document.getElementById(buttonId);
                if (buttonElement) {
                    window.google.accounts.id.renderButton(
                        buttonElement,
                        {
                            theme: 'outline',
                            size: 'large',
                            shape: 'pill',
                            width: 250
                        }
                    );
                }
            }
        };

        let interval: ReturnType<typeof setInterval>;
        if (window.google && window.google.accounts) {
            initializeGoogleSignIn();
        } else {
            interval = setInterval(() => {
                if (window.google && window.google.accounts) {
                    initializeGoogleSignIn();
                    clearInterval(interval);
                }
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [clientId, buttonId]);

    return (
        <>
            <div className="flex flex-col items-center justify-center p-4">
                <div id={buttonId}></div>
            </div>

            {/* Premium Full-Screen Onboarding Blur Overlay Modal */}
            <AnimatePresence>
                {showUsernameModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/5 w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e505_1px,transparent_1px),linear-gradient(to_bottom,#4f46e505_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

                            <div className="relative z-10 space-y-6">
                                {/* Navigation and Step Headers */}
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                                    {onboardingStep === 2 ? (
                                        <button
                                            type="button"
                                            onClick={() => setOnboardingStep(1)}
                                            className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Back
                                        </button>
                                    ) : (
                                        <div className="w-10" /> // spacer
                                    )}
                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                        Step {onboardingStep} of 2
                                    </span>
                                    <div className="w-10" /> {/* spacer */}
                                </div>

                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                                        {onboardingStep === 1 ? (
                                            <Sparkles className="w-10 h-10" />
                                        ) : (
                                            <User className="w-10 h-10" />
                                        )}
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                        {onboardingStep === 1 ? 'Favorite Name' : 'Choose Handle'}
                                    </h2>
                                    
                                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-sm mx-auto">
                                        {onboardingStep === 1 
                                            ? 'Which name would you like to continue with? Enter your favorite display name to represent you across CampusConnect.' 
                                            : 'Select a unique @handle for your profile URL, rankings, and listings across the network.'
                                        }
                                    </p>
                                </div>

                                {/* Onboarding Wizards Step Forms */}
                                <AnimatePresence mode="wait">
                                    {onboardingStep === 1 ? (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4 pt-2"
                                        >
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Favorite Display Name"
                                                    value={favoriteNameInput}
                                                    onChange={(e) => setFavoriteNameInput(e.target.value)}
                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-inner focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white text-lg font-semibold text-center"
                                                    maxLength={30}
                                                    required
                                                />
                                            </div>

                                            {favoriteNameError && (
                                                <p className="text-xs text-rose-500 font-bold flex items-center justify-center gap-1.5">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {favoriteNameError}
                                                </p>
                                            )}

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowUsernameModal(false);
                                                        setPendingUserInfo(null);
                                                    }}
                                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!!favoriteNameError}
                                                    onClick={() => setOnboardingStep(2)}
                                                    className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10"
                                                >
                                                    Next Handle <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.form
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={handleConfirmUsername}
                                            className="space-y-4 pt-2"
                                        >
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-lg">@</span>
                                                <input
                                                    type="text"
                                                    placeholder="username"
                                                    value={usernameInput}
                                                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().trim())}
                                                    className="w-full pl-9 pr-12 py-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-inner focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white text-lg font-semibold"
                                                    maxLength={15}
                                                    required
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                                    {isCheckingUsername && <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />}
                                                    {!isCheckingUsername && usernameSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                                    {!isCheckingUsername && usernameError && <AlertCircle className="w-5 h-5 text-rose-500" />}
                                                </div>
                                            </div>

                                            {/* Availability Validation Messaging */}
                                            <AnimatePresence mode="wait">
                                                {usernameError && (
                                                    <motion.p
                                                        key="error"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="text-xs text-rose-500 font-bold flex items-center justify-center gap-1.5"
                                                    >
                                                        <AlertCircle className="w-3.5 h-3.5" /> {usernameError}
                                                    </motion.p>
                                                )}
                                                {usernameSuccess && (
                                                    <motion.p
                                                        key="success"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="text-xs text-emerald-500 dark:text-emerald-450 font-bold flex items-center justify-center gap-1.5"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> {usernameSuccess}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setOnboardingStep(1)}
                                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!usernameSuccess || isCheckingUsername || isSaving}
                                                    className="flex-1 py-4 bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
                                                >
                                                    {isSaving ? (
                                                        <>Creating Account...</>
                                                    ) : (
                                                        <>Confirm & Enter <ArrowRight className="w-4 h-4" /></>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GoogleLogin;
