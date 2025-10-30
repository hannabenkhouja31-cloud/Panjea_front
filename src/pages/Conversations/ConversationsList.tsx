import { createEffect, createMemo, For, Show } from "solid-js";
import { user } from "../../stores/userStore";
import { getMessagesByTripId, getUnreadCountForTrip, messagesStore, setMessageAsRead } from "../../stores/messagesStore";
import type { Trip } from "../../models";
import { MessageSquare } from "lucide-solid";
import { joinMultipleTripRooms } from "../../stores/websocketStore";

interface ConversationsListProps {
    selectedTrip: Trip | null;
    onSelect: (trip: Trip) => void;
}

export const ConversationsList = (props: ConversationsListProps) => {

    const getFirstTripImage = (tripItem: Trip) => {
        if (tripItem.media && tripItem.media.length > 0) {
            return tripItem.media[0].url;
        }
        return "/images/citiesBeautiful.png";
    };

    const isUserTrip = (organizerId: string) => {
        return user.profile?.id === organizerId;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getLastMessage = (tripId: string) => {
        const messages = messagesStore.messagesByTrip[tripId];
        return messages && messages.length > 0 ? messages[0] : null;
    };

    const handleConversationSelect = (tripItem: Trip) => {
        const currentUserId = user.profile?.id;
        
        if (!currentUserId) {
            props.onSelect(tripItem);
            return;
        }

        const messages = messagesStore.messagesByTrip[tripItem.id];
        if (!messages || messages.length === 0) {
            props.onSelect(tripItem);
            return;
        }

        let mostRecentUnreadMessageId: string | null = null;
        for (const message of messages) {
            const isSentByMe = message.sender.id === currentUserId;
            
            if (isSentByMe) {
                break;
            }

            const iHaveReadIt = message.readBy && message.readBy.includes(currentUserId);

            if (!iHaveReadIt) {
                mostRecentUnreadMessageId = message.id;
                break;
            }
        }

        if (mostRecentUnreadMessageId) {
            setMessageAsRead(mostRecentUnreadMessageId, currentUserId)
                .catch(err => {
                    console.error("Échec de la mise à jour 'lu' en arrière-plan:", err);
                });
        }
        
        props.onSelect(tripItem);
    };

    const getNumberOfUnreadMessage = (tripId: string): string | null => {
        const currentUserId = user.profile?.id;
        if (!currentUserId) return null;

        const count = getUnreadCountForTrip(tripId, currentUserId);
        
        if (count === 0) return null;
        if (count >= 10) return '10+';
        
        return count.toString();
    };

    const sortedTrips = createMemo(() => {
        const trips = [...user.trips];
        const currentUserId = user.profile?.id;

        if (!currentUserId) return trips;

        return trips.sort((a, b) => {
            const unreadCountA = getUnreadCountForTrip(a.id, currentUserId);
            const unreadCountB = getUnreadCountForTrip(b.id, currentUserId);
            const lastMessageA = getLastMessage(a.id);
            const lastMessageB = getLastMessage(b.id);

            const hasUnreadA = unreadCountA > 0;
            const hasUnreadB = unreadCountB > 0;
            const hasMessageA = lastMessageA !== null;
            const hasMessageB = lastMessageB !== null;

            if (hasUnreadA && !hasUnreadB) return -1;
            if (!hasUnreadA && hasUnreadB) return 1;

            if (hasUnreadA && hasUnreadB) {
                return new Date(lastMessageB!.createdAt).getTime() - new Date(lastMessageA!.createdAt).getTime();
            }

            if (hasMessageA && !hasMessageB) return -1;
            if (!hasMessageA && hasMessageB) return 1;

            if (hasMessageA && hasMessageB) {
                return new Date(lastMessageB!.createdAt).getTime() - new Date(lastMessageA!.createdAt).getTime();
            }

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    });

    createEffect(() => {
        const trips = user.trips;
        const currentUserId = user.profile?.id;

        if (currentUserId && trips.length > 0) {
            joinMultipleTripRooms(trips, currentUserId);
            
            trips.forEach(trip => {
                const meta = messagesStore.metaByTrip[trip.id];
                
                if (!meta) {
                    getMessagesByTripId(trip.id, currentUserId, 1)
                        .catch(err => {
                            console.error(`Erreur lors du chargement des messages pour ${trip.id}`, err);
                        });
                }
            });
        }
    });
    

    return (
        <div class="border-r-2 border-black w-1/4 flex flex-col h-full">
            <div class="p-4 border-b-2 border-black flex items-center min-h-[7vh] flex-shrink-0">
                <h2 class="text-xl font-bold text-color-dark">Conversations</h2>
            </div>
            <div class="flex-1 overflow-y-auto">
                <For each={sortedTrips()}>
                    {(tripItem) => {
                        const lastMessage = () => getLastMessage(tripItem.id);

                        const unreadCount = () => getNumberOfUnreadMessage(tripItem.id);

                        const formattedLastMessage = createMemo(() => {
                            const msg = lastMessage();
                            if (!msg) return { text: "Aucun message", isNotification: false };

                            if (msg.questionData) {
                                if (msg.questionData.type === 'question') {
                                    if (isUserTrip(tripItem.organizerId)) {
                                        return { 
                                            text: `Question de ${msg.sender.username}`, 
                                            isNotification: true 
                                        };
                                    } else {
                                        return { 
                                            text: `Votre question`,
                                            isNotification: true
                                        };
                                    }
                                } else if (msg.questionData.type === 'answer') {
                                    if (isUserTrip(tripItem.organizerId)) {
                                        return { 
                                            text: `Vous avez répondu`, 
                                            isNotification: true 
                                        };
                                    } else {
                                        return { 
                                            text: `Réponse de ${msg.sender.username}`,
                                            isNotification: true
                                        };
                                    }
                                }
                            }
                            
                            return { 
                                text: `${msg.sender.username}: ${msg.content}`, 
                                isNotification: false 
                            };
                        });

                        return (
                            <div
                                onClick={() => handleConversationSelect(tripItem)}
                                class={` p-4 border-b cursor-pointer transition-colors ${
                                    props.selectedTrip?.id === tripItem.id
                                        ? "bg-color-main border-color-main" 
                                        : "border-gray-200 hover:bg-color-light"
                                }`}
                            >
                                <div class="flex items-start gap-3">
                                    <img 
                                        src={getFirstTripImage(tripItem)}
                                        alt={tripItem.title}
                                        class={`w-12 h-12 rounded-lg object-cover flex-shrink-0 ${
                                            props.selectedTrip?.id === tripItem.id ? "border-2 border-white" : "border-2 border-black"
                                        }`}
                                    />
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-start justify-between gap-2 mb-1">
                                            <div class="flex-1 min-w-0">
                                                <h3 class={`font-bold truncate ${
                                                    props.selectedTrip?.id === tripItem.id ? "text-white" : "text-color-dark"
                                                }`}>
                                                    {tripItem.title}
                                                </h3>
                                                {isUserTrip(tripItem.organizerId) && (
                                                    <span class={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                                                        props.selectedTrip?.id === tripItem.id 
                                                            ? "bg-white text-color-main" 
                                                            : "bg-color-main text-white"
                                                    }`}>
                                                        Mon voyage
                                                    </span>
                                                )}
                                            </div>
                                            <Show when={lastMessage()}>
                                                <span class={`text-xs flex-shrink-0 ${
                                                    props.selectedTrip?.id === tripItem.id ? "text-white opacity-80" : "text-gray-500"
                                                }`}>
                                                    {formatTime(lastMessage()!.createdAt)}
                                                </span>
                                            </Show>
                                        </div>
                                        <div class={`relative top-1 pr-8 text-sm truncate flex items-center gap-1.5 ${
                                            props.selectedTrip?.id === tripItem.id ? "text-white/80" : "text-black/60"
                                        }`}>
                                            <Show when={formattedLastMessage().isNotification}>
                                                <MessageSquare size={14} class={
                                                    props.selectedTrip?.id === tripItem.id 
                                                        ? "text-white/80" 
                                                        : "text-color-secondary"
                                                } />
                                            </Show>
                                            <span class="truncate">
                                                {formattedLastMessage().text}
                                            </span>
                                            <Show when={unreadCount()}>
                                                {(count) => (
                                                    <div class="absolute right-1 top-0 bottom-0 flex items-center justify-center">
                                                        <div class="min-w-[20px] h-5 px-1 bg-color-secondary rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                            {count()}
                                                        </div>
                                                    </div>
                                                )}
                                            </Show>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                </For>
            </div>
        </div>
    );
};