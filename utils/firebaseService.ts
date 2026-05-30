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

export const firebaseService = {
    /**
     * Sends a chat message to Firestore (either channel message or private direct message).
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
        try {
            await addDoc(collection(db, 'chats'), {
                sender_id: senderId.toLowerCase(),
                sender_name: senderName,
                sender_avatar: senderAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(senderName)}`,
                content: content.trim(),
                timestamp: new Date().toISOString(),
                type,
                target: target.toLowerCase()
            });
        } catch (error) {
            console.error('Failed to send chat message:', error);
            throw error;
        }
    },

    /**
     * Subscribes to real-time updates for channel or DM messages.
     * Returns an unsubscribe function.
     */
    subscribeToMessages(
        type: 'channel' | 'direct',
        target: string,
        callback: (messages: ChatMessage[]) => void
    ) {
        const q = query(
            collection(db, 'chats'),
            where('type', '==', type),
            where('target', '==', target.toLowerCase()),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
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
            console.error(`Error in chat subscription for target ${target}:`, error);
        });
    }
};
