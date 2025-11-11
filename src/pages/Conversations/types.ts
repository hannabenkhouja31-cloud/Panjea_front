import type { Trip } from "../../models";

export interface ConversationViewProps {
    trip: Trip | null;
    isQuestionView?: boolean;
}

export interface Message {
    id: string;
    content: string;
    sender: {
        id: string;
        username: string;
        profilePictureUrl?: string;
    };
    createdAt: string;
    readBy?: string[];
    questionData?: {
        type: 'question' | 'answer' | 'join_request' | 'join_accepted' | 'join_declined' | 'join_notification';
        askerId?: string;
    };
}