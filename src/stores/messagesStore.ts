import { createStore } from "solid-js/store";
import type { Message } from "../models/message.model";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface MessagesStore {
  messagesByTrip: Record<string, Message[]>;
  metaByTrip: Record<string, { page: number; hasMore: boolean }>;
  unansweredQuestions: Message[];
  questionTrips: any[];
}

const [messagesStore, setMessagesStore] = createStore<MessagesStore>({
  messagesByTrip: {},
  metaByTrip: {},
  unansweredQuestions: [],
  questionTrips: [],
});

const getMessagesByTripId = async (tripId: string, userId: string, page: number = 1, append: boolean = false) => {
  try {
    const response = await fetch(`${backendUrl}/messages/trip/${tripId}?page=${page}&limit=30`, {
      headers: {
        'x-user-id': userId,
      },
    });
    
    if (response.status === 200) {
      const result = await response.json();
      
      const safeMessages = result.data.map((msg: Message) => ({
        ...msg,
        readBy: msg.readBy ?? []
      }));
      
      if (append) {
        const currentMessages = messagesStore.messagesByTrip[tripId] || [];
        setMessagesStore("messagesByTrip", tripId, [...currentMessages, ...safeMessages]);
      } else {
        setMessagesStore("messagesByTrip", tripId, safeMessages);
      }
      
      setMessagesStore("metaByTrip", tripId, {
        page: result.meta.page,
        hasMore: result.meta.hasMore,
      });
      
      return { success: true, data: result };
    } else {
      return { success: false, error: "Erreur lors de la récupération des messages" };
    }
  } catch (error) {
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const getLastMessagesByTrips = async (tripIds: string[], userId: string) => {
  try {
    const response = await fetch(`${backendUrl}/messages/last-messages?tripIds=${tripIds.join(',')}`, {
      headers: {
        'x-user-id': userId,
      },
    });

    if (response.status === 200) {
      const lastMessages = await response.json();
      
      lastMessages.forEach((message: Message) => {
        const safeMessage = {
          ...message,
          readBy: message.readBy ?? []
        };
        setMessagesStore("messagesByTrip", message.tripId, [safeMessage]);
      });
      
      return { success: true, data: lastMessages };
    } else {
      return { success: false, error: "Erreur lors de la récupération des derniers messages" };
    }
  } catch (error) {
    console.error('Erreur getLastMessagesByTrips:', error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const addMessage = (message: Message) => {
  const safeMessage = {
    ...message,
    readBy: message.readBy ?? []
  };
  const currentMessages = messagesStore.messagesByTrip[message.tripId] || [];
  setMessagesStore("messagesByTrip", message.tripId, [safeMessage, ...currentMessages]);
};

const setMessageAsRead = async (messageId: string, userId: string) => {
    
  Object.entries(messagesStore.messagesByTrip).forEach(([tid, messages]) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      setMessagesStore(
        "messagesByTrip",
        tid,
        (m) => m.id === messageId,
        "readBy",
        (current) => {
          if (!current) return [userId];
          return current.includes(userId) ? current : [...current, userId];
        }
      );
    }
  });

  try {
    const response = await fetch(`${backendUrl}/messages/readBy?messageId=${messageId}`, {
      method: 'POST', 
      headers: {
        'x-user-id': userId,
      },
    });

    if (!response.ok) {
      console.error('Erreur lors de la mise à jour du message comme lu');
      return { success: false };
    }

    const updatedMessage: Message = await response.json();
    
    return { success: true, data: updatedMessage };

  } catch (error) {
    console.error('Impossible de marquer le message comme lu:', error);
    return { success: false };
  }
};

const getUnreadCountForTrip = (tripId: string, userId: string): number => {
  const messages = messagesStore.messagesByTrip[tripId];

  if (!messages || messages.length === 0) {
    return 0;
  }

  let unreadCount = 0;
  const maxCount = 10;

  for (const message of messages) {
    const isSentByMe = message.sender.id === userId;

    if (isSentByMe) {
      break;
    }

    const iHaveReadIt = message.readBy && message.readBy.includes(userId);

    if (iHaveReadIt) {
      break;
    }

    unreadCount++;

    if (unreadCount >= maxCount) {
      return maxCount;
    }
  }

  return unreadCount;
};

const getTotalUnreadCount = (userId: string): number => {
  let total = 0;
  
  Object.keys(messagesStore.messagesByTrip).forEach(tripId => {
    total += getUnreadCountForTrip(tripId, userId);
  });

  return total > 99 ? 99 : total;
};

const updateMessage = (updatedMessage: Message) => {
  const tripId = updatedMessage.tripId;
  const messages = messagesStore.messagesByTrip[tripId];
  
  if (messages) {
    const index = messages.findIndex(m => m.id === updatedMessage.id);
    if (index !== -1) {
      const newMessages = [...messages];
      newMessages[index] = {
        ...updatedMessage,
        readBy: updatedMessage.readBy ?? []
      };
      setMessagesStore("messagesByTrip", tripId, newMessages);
    }
  }
};

const getUnansweredQuestions = async (userId: string) => {
  console.log('[getUnansweredQuestions] Début - userId:', userId);
  
  try {
    const response = await fetch(`${backendUrl}/messages/my-unanswered-questions`, {
      headers: {
        'x-user-id': userId,
      },
    });
    
    
    if (response.status === 200) {
      const unansweredQuestions = await response.json();
      
      setMessagesStore("unansweredQuestions", unansweredQuestions);
      
      return { success: true, data: unansweredQuestions };
    } else {
      return { success: false, error: "Erreur lors de la récupération des questions" };
    }
  } catch (error) {
    console.error('[getUnansweredQuestions] Exception:', error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const markTripQuestionsAsRead = async (tripId: string, userId: string) => {
  
  try {
    const response = await fetch(`${backendUrl}/messages/mark-trip-questions-read/${tripId}`, {
      method: 'POST',
      headers: {
        'x-user-id': userId,
      },
    });
    
    
    if (response.status === 200) {
      
      setMessagesStore(
        "unansweredQuestions", 
        messagesStore.unansweredQuestions.filter(q => q.tripId !== tripId)
      );
      
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false };
  }
};

const getUnansweredQuestionsCount = (userId: string): number => {
  console.log('', userId);
  const count = messagesStore.unansweredQuestions.length;
  
  return count;
};

const getQuestionTrips = (): Array<{tripId: string, tripTitle: string, lastUpdate: string}> => {
  const questionTrips = new Map<string, {tripId: string, tripTitle: string, lastUpdate: string}>();
  
  messagesStore.unansweredQuestions.forEach(question => {
    if (!questionTrips.has(question.tripId)) {
      questionTrips.set(question.tripId, {
        tripId: question.tripId,
        tripTitle: '',
        lastUpdate: question.createdAt
      });
    }
  });
  
  return Array.from(questionTrips.values());
};

const getTripsWithQuestions = async (userId: string) => {
  try {
    const response = await fetch(`${backendUrl}/messages/trips-with-questions`, {
      headers: {
        'x-user-id': userId,
      },
    });
    
    if (response.status === 200) {
      const trips = await response.json();
      setMessagesStore("questionTrips", trips);
      return { success: true, data: trips };
    } else {
      return { success: false, error: "Erreur lors de la récupération des trips" };
    }
  } catch (error) {
    console.error('Erreur getTripsWithQuestions:', error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const clearAllMessages = () => {
  setMessagesStore("messagesByTrip", {});
  setMessagesStore("metaByTrip", {});
};

const clearMessages = (tripId: string) => {
  setMessagesStore("messagesByTrip", tripId, []);
  
  const newMeta = { ...messagesStore.metaByTrip };
  delete newMeta[tripId];
  setMessagesStore("metaByTrip", newMeta);
};

export {
  messagesStore,
  getMessagesByTripId,
  getLastMessagesByTrips,
  getTotalUnreadCount,
  getUnreadCountForTrip,
  getTripsWithQuestions,
  addMessage,
  updateMessage,
  markTripQuestionsAsRead,
  getQuestionTrips,
  getUnansweredQuestions,
  getUnansweredQuestionsCount,
  setMessageAsRead,
  clearMessages,
  clearAllMessages,
};