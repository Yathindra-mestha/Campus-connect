import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
    id?: string;
    sender_id: string;
    sender_name: string;
    sender_avatar: string;
    content: string;
    timestamp: string;
    type: 'channel' | 'direct';
    target: string;
}

// Check if Firebase credentials are configured in environment variables
const isFirebaseAvailable = (): boolean => {
    return typeof window !== 'undefined' && !!import.meta.env.VITE_FIREBASE_API_KEY;
};

// Global flag to track whether to use Firestore. Will heal/fallback at runtime if Firestore fails.
let useFirestore = isFirebaseAvailable();

// Seed chat conversations to populate UI out-of-the-box
const SEED_MESSAGES: ChatMessage[] = [
    {
        id: 'seed-msg-1',
        sender_id: 'sarah-jenkins',
        sender_name: 'Sarah Jenkins',
        sender_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Jenkins',
        content: 'Thinking of starting a new AI study group here. Anyone in?',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        type: 'channel',
        target: 'global'
    },
    {
        id: 'seed-msg-2',
        sender_id: 'alex-chen',
        sender_name: 'Alex Chen',
        sender_avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex%20Chen',
        content: "I'm definitely interested! Which stack are we looking at?",
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(), // 1.9 hours ago
        type: 'channel',
        target: 'global'
    }
];

// Helper to retrieve LocalStorage chats with automatic seeding
const getLocalChats = (): ChatMessage[] => {
    if (typeof window === 'undefined') return [];
    try {
        const chatsStr = localStorage.getItem('campusconnect_chats');
        if (!chatsStr) {
            localStorage.setItem('campusconnect_chats', JSON.stringify(SEED_MESSAGES));
            return SEED_MESSAGES;
        }
        return JSON.parse(chatsStr);
    } catch (e) {
        console.error('Failed to parse local chats:', e);
        return [];
    }
};

// Helper to save LocalStorage chats and dispatch updates within the active tab
const saveLocalChats = (chats: ChatMessage[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('campusconnect_chats', JSON.stringify(chats));
        // Dispatch custom event to notify listeners in the active tab
        window.dispatchEvent(new CustomEvent('campusconnect_local_chat_update'));
    } catch (e) {
        console.error('Failed to save local chats:', e);
    }
};

export const firebaseService = {
    /**
     * Sends a chat message. Automatically falls back to LocalStorage if Firestore throws any write error.
     */
    async sendChatMessage(
        senderId: string,
        senderName: string,
        senderAvatar: string,
        content: string,
        type: 'channel' | 'direct',
        target: string
    ) {
        if (!content.trim()) return;
        const targetLower = target.toLowerCase();
        const senderIdLower = senderId.toLowerCase();
        const finalAvatar = senderAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(senderName)}`;

        if (useFirestore) {
            try {
                await addDoc(collection(db, 'chats'), {
                    sender_id: senderIdLower,
                    sender_name: senderName,
                    sender_avatar: finalAvatar,
                    content: content.trim(),
                    timestamp: new Date().toISOString(),
                    type,
                    target: targetLower
                });
                return; // Success!
            } catch (error) {
                console.error('Firestore write failed, falling back to LocalStorage engine:', error);
                useFirestore = false; // Disable Firestore for this session
                // Dispatch event to force all active subscription streams to fallback to LocalStorage
                window.dispatchEvent(new CustomEvent('campusconnect_chat_service_fallback'));
            }
        }

        // LocalStorage fallback sync engine
        const allChats = getLocalChats();
        const newMessage: ChatMessage = {
            id: `local-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender_id: senderIdLower,
            sender_name: senderName,
            sender_avatar: finalAvatar,
            content: content.trim(),
            timestamp: new Date().toISOString(),
            type,
            target: targetLower
        };
        allChats.push(newMessage);
        saveLocalChats(allChats);
    },

    /**
     * Subscribes to real-time updates for channel or DM messages.
     * Automatically handles dynamic runtime fallback if Firestore fails.
     */
    subscribeToMessages(
        type: 'channel' | 'direct',
        target: string,
        callback: (messages: ChatMessage[]) => void
    ): () => void {
        const targetLower = target.toLowerCase();
        let activeUnsubscribe: (() => void) | null = null;
        let isUnsubscribed = false;

        const startSubscription = () => {
            if (isUnsubscribed) return;

            if (useFirestore) {
                try {
                    const q = query(
                        collection(db, 'chats'),
                        where('type', '==', type),
                        where('target', '==', targetLower),
                        orderBy('timestamp', 'asc')
                    );

                    activeUnsubscribe = onSnapshot(q, (snapshot) => {
                        const messages = snapshot.docs.map(doc => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                sender_id: data.sender_id || '',
                                sender_name: data.sender_name || 'Anonymous Student',
                                sender_avatar: data.sender_avatar || '',
                                content: data.content || '',
                                timestamp: data.timestamp || new Date().toISOString(),
                                type: data.type || 'channel',
                                target: data.target || ''
                            } as ChatMessage;
                        });
                        callback(messages);
                    }, (error) => {
                        console.error(`Firestore subscription failed for ${targetLower}, falling back to LocalStorage:`, error);
                        useFirestore = false;
                        if (activeUnsubscribe) activeUnsubscribe();
                        startLocalStorageSubscription();
                    });
                } catch (e) {
                    console.error(`Firestore subscription startup failed for ${targetLower}, falling back to LocalStorage:`, e);
                    useFirestore = false;
                    startLocalStorageSubscription();
                }
            } else {
                startLocalStorageSubscription();
            }
        };

        const startLocalStorageSubscription = () => {
            if (isUnsubscribed) return;

            const deliverLocalMessages = () => {
                const allChats = getLocalChats();
                const filtered = allChats.filter(msg => 
                    msg.type === type && msg.target.toLowerCase() === targetLower
                ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                callback(filtered);
            };

            // Deliver initial state
            deliverLocalMessages();

            // Handler for storage updates from other tabs
            const handleStorageChange = (e: StorageEvent) => {
                if (e.key === 'campusconnect_chats') {
                    deliverLocalMessages();
                }
            };

            // Handler for storage updates in the same tab
            const handleLocalChange = () => {
                deliverLocalMessages();
            };

            window.addEventListener('storage', handleStorageChange);
            window.addEventListener('campusconnect_local_chat_update', handleLocalChange);

            activeUnsubscribe = () => {
                window.removeEventListener('storage', handleStorageChange);
                window.removeEventListener('campusconnect_local_chat_update', handleLocalChange);
            };
        };

        // Handler to trigger fallback across all active subscription instances
        const handleFallbackTrigger = () => {
            if (activeUnsubscribe) activeUnsubscribe();
            startLocalStorageSubscription();
        };

        window.addEventListener('campusconnect_chat_service_fallback', handleFallbackTrigger);

        startSubscription();

        return () => {
            isUnsubscribed = true;
            window.removeEventListener('campusconnect_chat_service_fallback', handleFallbackTrigger);
            if (activeUnsubscribe) activeUnsubscribe();
        };
    }
};
