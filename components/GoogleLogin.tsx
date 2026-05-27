import React, { useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENV_CONFIG } from '../src/constants/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

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

    const handleCredentialResponse = async (response: any) => {
        const userData = decodeJWT(response.credential);
        if (userData) {
            // No Supabase token exchange needed! Decode and set local session
            const username = userData.email.split('@')[0] || userData.name.toLowerCase().replace(/\s+/g, '');
            const userInfo: any = {
                id: userData.sub || userData.email,
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                login: username, // Use username parsed from email
                avatar_url: userData.picture,
                branch: 'Computer Science • CSE', // Default mock branch
                linkedin_url: '',
                github_url: `https://github.com/${username}`
            };

            // Sync user details to Firebase Firestore 'users' collection
            try {
                const userDocRef = doc(db, 'users', username.toLowerCase());
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    // Merge existing Firestore profile data into localStorage and our session!
                    const existingData = userDocSnap.data();
                    if (existingData.name) userInfo.name = existingData.name;
                    if (existingData.branch) userInfo.branch = existingData.branch;
                    if (existingData.bio) userInfo.bio = existingData.bio;
                    if (existingData.location) userInfo.location = existingData.location;
                    if (existingData.avatar_url) userInfo.avatar_url = existingData.avatar_url;
                } else {
                    // Create new user profile document in Firestore
                    await setDoc(userDocRef, {
                        id: userInfo.id,
                        login: username.toLowerCase(),
                        name: userInfo.name,
                        email: userInfo.email,
                        avatar_url: userInfo.avatar_url,
                        branch: userInfo.branch,
                        bio: '',
                        location: '',
                        created_at: new Date().toISOString(),
                        last_active_at: new Date().toISOString()
                    });
                }
            } catch (e) {
                console.error('Failed to sync user to Firestore:', e);
            }

            localStorage.setItem('googleUser', JSON.stringify(userInfo));

            // Sync user details to local users registry
            if (typeof window !== 'undefined') {
                try {
                    const localUsersStr = localStorage.getItem('campusconnect_users') || '{}';
                    const localUsers = JSON.parse(localUsersStr);
                    localUsers[userInfo.id] = userInfo;
                    localStorage.setItem('campusconnect_users', JSON.stringify(localUsers));
                } catch (e) {
                    console.error('Failed to sync to local user database', e);
                }
            }

            onLoginSuccess(userInfo);
            navigate('/profile');
        } else {
            if (onLoginFailure) onLoginFailure('Failed to decode user data');
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

        // Check if google script is loaded
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
    }, [clientId, buttonId]); // Added buttonId to dependencies

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div id={buttonId}></div>
        </div>
    );
};

export default GoogleLogin;
