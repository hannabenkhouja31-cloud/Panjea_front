export interface Message {
  id: string;
  tripId: string;
  content: string;
  questionData?: {
    askerId?: string;
    organizerId?: string;
    type: 'question' | 'answer' | 'join_request' | 'join_accepted' | 'join_declined' | 'join_notification';
    relatedQuestionId?: string;
  };
  visibleTo?: string[];
  createdAt: string;
  sender: {
    id: string;
    username: string;
    profilePictureUrl?: string;
  };
  readBy: string[]
}