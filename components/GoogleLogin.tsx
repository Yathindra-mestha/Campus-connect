import React, { useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getSupabaseConfig } from '../src/lib/supabaseClient';
import { ENV_CONFIG } from '../src/constants/config';

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
            // Sign in with Supabase using the ID token
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
            });

            if (error) {
                console.error('Supabase auth error:', error);
                let friendlyMessage = error.message;

                // Specifically check for common credential/config issues
                if (friendlyMessage === "Failed to fetch") {
                    const config = getSupabaseConfig();
                    friendlyMessage = `Network Error (Failed to fetch). 
Diagnostics:
- URL: ${config.url.substring(0, 25)}... ${config.isUrlPlaceholder ? '(PLACEHOLDER)' : '(OK)'}
- Key: ${config.key.substring(0, 15)}... ${config.isKeyPlaceholder ? '(PLACEHOLDER)' : '(OK)'}
Check your Vercel Environment Variables!`;
                } else if (error.status === 400 || error.message.includes('apiKey') || error.message.includes('JWT')) {
                    friendlyMessage = "Configuration error: Invalid Supabase API Key or Google Auth not enabled in Supabase.";
                } else if (error.message.includes('provider')) {
                    friendlyMessage = "Google Auth is not enabled in your Supabase project.";
                } else if (error.message.includes('authorized domain')) {
                    friendlyMessage = "This domain is not authorized for Google Login in Supabase.";
                }

                if (onLoginFailure) onLoginFailure(friendlyMessage);
                alert(`Login Failed: ${friendlyMessage}`);
                return;
            }

            const userInfo = {
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                login: userData.email, // Use email as login for consistency
                avatar_url: userData.picture,
                supabase_user: data.user
            };

            // Note: App.tsx will eventually handle the session from Supabase
            // but we keep this for backward compatibility during transition
            localStorage.setItem('googleUser', JSON.stringify(userInfo));
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
