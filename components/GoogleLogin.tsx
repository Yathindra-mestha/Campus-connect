import React, { useEffect } from 'react';

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

    const handleCredentialResponse = (response: any) => {
        const userData = decodeJWT(response.credential);
        if (userData) {
            // Store in localStorage as requested
            const userInfo = {
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                login: userData.email, // Use email as login for consistency with App.tsx
                avatar_url: userData.picture
            };
            localStorage.setItem('googleUser', JSON.stringify(userInfo));
            onLoginSuccess(userInfo);
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

                window.google.accounts.id.renderButton(
                    document.getElementById('google-signin-button'),
                    {
                        theme: 'outline',
                        size: 'large',
                        shape: 'pill',
                        width: 250
                    }
                );
            }
        };

        // Check if google script is loaded
        if (window.google && window.google.accounts) {
            initializeGoogleSignIn();
        } else {
            const interval = setInterval(() => {
                if (window.google && window.google.accounts) {
                    initializeGoogleSignIn();
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [clientId]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div id="google-signin-button"></div>
        </div>
    );
};

export default GoogleLogin;
