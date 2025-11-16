import { createEffect, createSignal, Show } from "solid-js";
import { ConversationsList } from "./ConversationsList";
import { ConversationView } from "./ConversationView";
import { QuestionTripsList } from "./QuestionTripsList";
import type { Trip } from "../../models";
import { user } from "../../stores/userStore";
import { messagesStore } from "../../stores/messagesStore";
import { useNavigate } from "@solidjs/router";

export const ConversationsPage = () => {

    const navigate = useNavigate();
    
    const [selectedConversation, setSelectedConversation] = createSignal<Trip | null>(null);
    const [selectedQuestionTrip, setSelectedQuestionTrip] = createSignal<any | null>(null);
    const [activeTab, setActiveTab] = createSignal<'conversations' | 'questions'>('conversations');

    createEffect(() => {
                if (!user.isConnected) {
                    navigate("/inscription", { replace: true });
                }
        });
        
    const hasMessages = () => {
        if (user.trips.length === 0) return true;
        
        const tripsWithMessages = user.trips.filter(trip => 
            messagesStore.messagesByTrip[trip.id] !== undefined
        );

        return tripsWithMessages.length > 0;
    };

    const questionsCount = () => messagesStore.unansweredQuestions.length;

    const handleTabChange = (tab: 'conversations' | 'questions') => {
        setActiveTab(tab);
        setSelectedConversation(null);
        setSelectedQuestionTrip(null);
    };

    return (
        <div class="bg-color-light w-full h-screen pt-16">
            <div class="container-app h-full py-8">
                <div class="border-2 border-black rounded-2xl h-3/4 flex flex-col w-full overflow-hidden bg-white">
                    
                    <div class="flex gap-2 border-b-2 border-black p-4">
                        <button
                            onClick={() => handleTabChange('conversations')}
                            class={`px-6 py-3 font-semibold rounded-xl transition-all ${
                                activeTab() === 'conversations'
                                    ? 'bg-color-main text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Conversations
                        </button>
                        <button
                            onClick={() => handleTabChange('questions')}
                            class={`px-6 py-3 font-semibold rounded-xl transition-all relative ${
                                activeTab() === 'questions'
                                    ? 'bg-color-main text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Mes Questions
                            <Show when={questionsCount() > 0}>
                                <span class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-color-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {questionsCount()}
                                </span>
                            </Show>
                        </button>
                    </div>

                    <div class="flex-1 flex flex-row overflow-hidden">
                        <Show when={activeTab() === 'conversations'}>
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
                        </Show>

                        <Show when={activeTab() === 'questions'}>
                            <QuestionTripsList 
                                selectedTripId={selectedQuestionTrip()?.id || null}
                                onSelect={setSelectedQuestionTrip}
                            />
                            <ConversationView 
                                trip={selectedQuestionTrip()} 
                                isQuestionView={true}
                            />
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    );
};