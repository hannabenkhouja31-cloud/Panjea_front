import { createSignal, Show } from "solid-js";
import { ConversationsList } from "./ConversationsList";
import { ConversationView } from "./ConversationView";
import type { Trip } from "../../models";
import { user } from "../../stores/userStore";
import { messagesStore } from "../../stores/messagesStore";

export const ConversationsPage = () => {
    const [selectedConversation, setSelectedConversation] = createSignal<Trip | null>(null);

    const hasMessages = () => {
        if (user.trips.length === 0) return true;
        
        const tripsWithMessages = user.trips.filter(trip => 
            messagesStore.messagesByTrip[trip.id] !== undefined
        );

        return tripsWithMessages.length > 0;
    };

    return (
        <div class="bg-color-light w-full h-screen pt-16">
            <div class="container-app h-full py-8">
                <div class="border-2 border-black rounded-2xl h-3/4 flex flex-row w-full overflow-hidden bg-white">
                    <Show 
                        when={hasMessages()}
                        fallback={
                            <div class="flex-1 flex flex-col items-center justify-center gap-4">
                                <span class="loading loading-spinner loading-lg text-color-main"></span>
                                <p class="text-color-dark opacity-60">Chargement de vos conversations...</p>
                            </div>
                        }
                    >
                        <Show 
                            when={user.trips.length > 0}
                            fallback={
                                <div class="flex-1 flex flex-col items-center justify-center gap-4">
                                    <p class="text-color-dark text-xl font-semibold">Aucune conversation</p>
                                    <p class="text-gray-500">Rejoignez ou créez un voyage pour commencer à discuter !</p>
                                </div>
                            }
                        >
                            <ConversationsList 
                                selectedTrip={selectedConversation()} 
                                onSelect={setSelectedConversation} 
                            />
                            <ConversationView trip={selectedConversation()} />
                        </Show>
                    </Show>
                </div>
            </div>
        </div>
    );
};