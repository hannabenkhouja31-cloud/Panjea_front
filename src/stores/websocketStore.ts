import { io, Socket } from "socket.io-client";
import { createStore } from "solid-js/store";
import { getUserMemberTripsFromDatabase, setUserTrips, user } from "./userStore";
import { addMessage, getLastMessagesByTrips, clearAllMessages, updateMessage } from "./messagesStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

type WebsocketStore = {
    socket: Socket | null;
    isConnected: boolean;
    isIdentified: boolean;
    pendingRooms: string[];
}

const [websocket, setWebsocket] = createStore<WebsocketStore>({
    socket: null,
    isConnected: false,
    isIdentified: false,
    pendingRooms: [],
})

const handleMemberAccepted = async (tripId: string) => {
    if (!user.profile?.id) return;
        
    const memberTrips = await getUserMemberTripsFromDatabase(user.profile.id);
    if (memberTrips.success && memberTrips.data) {
        setUserTrips(memberTrips.data);
        joinTripRoom(tripId, user.profile.id);
        await getLastMessagesByTrips([tripId],user.profile.id);
    }
};

const joinPendingRooms = (userId: string) => {
    if (websocket.pendingRooms.length > 0) {
        console.log(`🚪 Joining ${websocket.pendingRooms.length} pending rooms`);
        websocket.pendingRooms.forEach(tripId => {
            websocket.socket?.emit('joinTrip', { tripId, userId });
        });
        setWebsocket("pendingRooms", []);
    }
};

const initSocket = () => {
    return new Promise<void>((resolve) => {
        
        if (websocket.socket?.connected) {
            resolve();
            return;
        }

        const socket = io(backendUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });
        
        socket.on('connect', () => {
            setWebsocket("isConnected", true);
            
            if (user.profile?.id) {
                socket.emit('identification', user.profile.id);
            }
            
            resolve();
        });

        socket.on('disconnect', () => {
            setWebsocket("isConnected", false);
            setWebsocket("isIdentified", false);
        });

        socket.on('identification', () => {
            setWebsocket("isIdentified", true);
            
            if (user.profile?.id) {
                joinPendingRooms(user.profile.id);
            }
        });

        socket.on('newMessage', (message) => {
            addMessage(message);
        });

        socket.on('messageUpdated', (message) => {
            updateMessage(message);
        });

        socket.on('joinedTrip', () => {
        });

        socket.on('leftTrip', () => {
        });

        socket.on('memberAccepted', async (data: { tripId: string }) => {
            await handleMemberAccepted(data.tripId);
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        socket.on('reconnect', () => {
            if (user.profile?.id) {
                socket.emit('identification', user.profile.id);
            }
        });

        setWebsocket("socket", socket);
    });
}

const identifyUser = (userId: string) => {
    if (websocket.socket?.connected) {
        websocket.socket.emit('identification', userId);
    } else {
        console.warn('Cannot identify: socket not connected');
    }
};

const sendMyId = () => {
    if (user.profile?.id && websocket.socket?.connected) {
        identifyUser(user.profile.id);
    } else {
        console.warn('Cannot send ID: socket not connected or no user profile');
    }
}

const joinTripRoom = (tripId: string, userId: string) => {
    if (websocket.socket?.connected && websocket.isIdentified) {
        websocket.socket.emit('joinTrip', { tripId, userId });
    } else if (websocket.socket?.connected && !websocket.isIdentified) {
        setWebsocket("pendingRooms", [...websocket.pendingRooms, tripId]);
    } else {
        console.warn('Cannot join room: socket not connected');
    }
}

const joinMultipleTripRooms = (trips: { id: string }[], userId: string) => {
    if (!websocket.socket?.connected) {
        console.warn('Cannot join rooms: socket not connected');
        return;
    }

    if (!websocket.isIdentified) {
        setWebsocket("pendingRooms", trips.map(t => t.id));
        return;
    }

    trips.forEach(trip => {
        websocket.socket?.emit('joinTrip', { tripId: trip.id, userId });
    });
}

const leaveTripRoom = (tripId: string) => {
    if (websocket.socket?.connected) {
        websocket.socket.emit('leaveTrip', { tripId });
    }
}

const sendMessage = (tripId: string, userId: string, content: string) => {
    if (websocket.socket?.connected) {
        websocket.socket.emit('sendMessage', { tripId, userId, content });
    } else {
        console.warn('⚠️ Cannot send message: socket not connected');
    }
}

const cleanupSocket = () => {
    if (websocket.socket) {
        websocket.socket.removeAllListeners();
        websocket.socket.disconnect();
        setWebsocket({
            socket: null,
            isConnected: false,
            isIdentified: false,
            pendingRooms: [],
        });
    }
};

const resetSocket = () => {
    cleanupSocket();
    clearAllMessages();
};

const disconnectSocket = () => {
    if (websocket.socket) {
        websocket.socket.disconnect();
        setWebsocket("isConnected", false);
        setWebsocket("isIdentified", false);
    }
}

export {
    websocket,
    initSocket,
    sendMyId,
    identifyUser,
    disconnectSocket,
    cleanupSocket,
    resetSocket,
    joinTripRoom,
    joinMultipleTripRooms,
    leaveTripRoom,
    sendMessage,
}