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

    // État
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
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
        setSelectedQuestionTrip(null);
    };

    const isChatActive = () => !!selectedConversation() || !!selectedQuestionTrip();

    return (
        <div class="bg-color-light w-full h-[90vh] sm:h-screen pt-16 sm:pt-20">
            <div class="container-app h-full py-4 sm:py-8">
                <div class="border-0 sm:border-2 border-black rounded-2xl h-full sm:h-3/4 flex flex-col w-full overflow-hidden bg-white shadow-sm sm:shadow-none relative">

                    <div class={`flex-shrink-0 p-2 border-b-2 border-black sm:hidden ${isChatActive() ? 'hidden' : 'flex'} gap-2`}>
                        <button
                            onClick={() => handleTabChange('conversations')}
                            class={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border-2 ${
                                activeTab() === 'conversations'
                                    ? 'bg-color-main text-white border-color-main'
                                    : 'bg-white text-color-dark border-gray-200'
                            }`}
                        >
                            Conversations
                        </button>
                        <button
                            onClick={() => handleTabChange('questions')}
                            class={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border-2 relative ${
                                activeTab() === 'questions'
                                    ? 'bg-color-main text-white border-color-main'
                                    : 'bg-white text-color-dark border-gray-200'
                            }`}
                        >
                            Questions
                            <Show when={questionsCount() > 0}>
                                <span class="absolute -top-2 -right-2 w-5 h-5 bg-color-secondary rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                                    {questionsCount()}
                                </span>
                            </Show>
                        </button>
                    </div>

                    <div class="hidden sm:flex gap-2 border-b-2 border-black p-4 flex-shrink-0">
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

                    <div class="flex-1 flex flex-row overflow-hidden relative">

                        <div class={`w-full sm:w-1/4 flex-col h-full bg-white border-r-0 sm:border-r-2 border-black ${isChatActive() ? 'hidden sm:flex' : 'flex'}`}>
                            <Show when={activeTab() === 'conversations'}>
                                <Show
                                    when={hasMessages()}
                                    fallback={
                                        <div class="flex-1 flex flex-col items-center justify-center gap-4 p-4 text-center">
                                            <span class="loading loading-spinner loading-lg text-color-main"></span>
                                            <p class="text-color-dark opacity-60">Chargement...</p>
                                        </div>
                                    }
                                >
                                    <Show
                                        when={user.trips.length > 0}
                                        fallback={
                                            <div class="flex-1 flex flex-col items-center justify-center gap-4 p-4 text-center">
                                                <p class="text-color-dark text-lg font-semibold">Aucune conversation</p>
                                                <p class="text-gray-500 text-sm">Rejoignez un voyage !</p>
                                            </div>
                                        }
                                    >
                                        <ConversationsList
                                            selectedTrip={selectedConversation()}
                                            onSelect={(trip) => {
                                                setSelectedConversation(trip);
                                            }}
                                        />
                                    </Show>
                                </Show>
                            </Show>

                            <Show when={activeTab() === 'questions'}>
                                <QuestionTripsList
                                    selectedTripId={selectedQuestionTrip()?.id || null}
                                    onSelect={(trip) => {
                                        setSelectedQuestionTrip(trip);
                                    }}
                                />
                            </Show>
                        </div>

                        <div class={`w-full sm:flex-1 flex-col h-full bg-white ${!isChatActive() ? 'hidden sm:flex' : 'flex'}`}>
                            <Show when={activeTab() === 'conversations'}>
                                <ConversationView
                                    trip={selectedConversation()}
                                    onBack={handleBackToList}
                                />
                            </Show>

                            <Show when={activeTab() === 'questions'}>
                                <ConversationView
                                    trip={selectedQuestionTrip()}
                                    isQuestionView={true}
                                    onBack={handleBackToList}
                                />
                            </Show>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};