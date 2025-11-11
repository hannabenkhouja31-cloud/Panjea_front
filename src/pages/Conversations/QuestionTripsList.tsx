import { createSignal, For, onMount, Show } from "solid-js";
import { user } from "../../stores/userStore";
import { getTripsWithQuestions, messagesStore, markTripQuestionsAsRead } from "../../stores/messagesStore";
import { MessageSquare } from "lucide-solid";
import { getFirstTripImage, formatTime } from "./utils";

interface QuestionTripsListProps {
    selectedTripId: string | null;
    onSelect: (trip: any) => void;
}

export const QuestionTripsList = (props: QuestionTripsListProps) => {
    const [isLoading, setIsLoading] = createSignal(true);

    onMount(async () => {
        if (user.profile?.id) {
            await getTripsWithQuestions(user.profile.id);
            setIsLoading(false);
        }
    });

    const handleTripSelect = async (trip: any) => {
        if (user.profile?.id) {
            await markTripQuestionsAsRead(trip.id, user.profile.id);
            await getTripsWithQuestions(user.profile.id);
        }
        props.onSelect(trip);
    };

    return (
        <div class="border-r-2 border-black w-1/4 flex flex-col h-full">
            <div class="p-4 border-b-2 border-black flex items-center min-h-[7vh] flex-shrink-0">
                <h2 class="text-xl font-bold text-color-dark">Mes Questions</h2>
            </div>
            <div class="flex-1 overflow-y-auto">
                <Show when={!isLoading()} fallback={
                    <div class="flex justify-center items-center h-32">
                        <span class="loading loading-spinner loading-md text-color-main"></span>
                    </div>
                }>
                    <Show 
                        when={messagesStore.questionTrips.length > 0}
                        fallback={
                            <div class="flex flex-col items-center justify-center p-8 text-center">
                                <MessageSquare size={48} class="text-gray-300 mb-4" />
                                <p class="text-gray-500">Vous n'avez posé aucune question pour le moment</p>
                            </div>
                        }
                    >
                        <For each={messagesStore.questionTrips}>
                            {(trip) => (
                                <div
                                    onClick={() => handleTripSelect(trip)}
                                    class={`p-4 border-b cursor-pointer transition-colors ${
                                        props.selectedTripId === trip.id
                                            ? "bg-color-main border-color-main" 
                                            : "border-gray-200 hover:bg-color-light"
                                    }`}
                                >
                                    <div class="flex items-start gap-3">
                                        <img 
                                            src={getFirstTripImage(trip)}
                                            alt={trip.title}
                                            class={`w-12 h-12 rounded-lg object-cover flex-shrink-0 ${
                                                props.selectedTripId === trip.id ? "border-2 border-white" : "border-2 border-black"
                                            }`}
                                        />
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-start justify-between gap-2 mb-1">
                                                <h3 class={`font-bold truncate ${
                                                    props.selectedTripId === trip.id ? "text-white" : "text-color-dark"
                                                }`}>
                                                    {trip.title}
                                                </h3>
                                                <Show when={trip.lastMessageDate}>
                                                    <span class={`text-xs flex-shrink-0 ${
                                                        props.selectedTripId === trip.id ? "text-white opacity-80" : "text-gray-500"
                                                    }`}>
                                                        {formatTime(trip.lastMessageDate)}
                                                    </span>
                                                </Show>
                                            </div>
                                            <div class={`relative top-1 pr-8 text-sm truncate flex items-center gap-1.5 ${
                                                props.selectedTripId === trip.id ? "text-white/80" : "text-black/60"
                                            }`}>
                                                <MessageSquare size={14} class={
                                                    props.selectedTripId === trip.id 
                                                        ? "text-white/80" 
                                                        : "text-color-secondary"
                                                } />
                                                <span class="truncate">Vos questions sur ce voyage</span>
                                                <Show when={trip.unreadAnswersCount > 0}>
                                                    <div class="absolute right-1 top-0 bottom-0 flex items-center justify-center">
                                                        <div class="min-w-[20px] h-5 px-1 bg-color-secondary rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                            {trip.unreadAnswersCount}
                                                        </div>
                                                    </div>
                                                </Show>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>
                    </Show>
                </Show>
            </div>
        </div>
    );
};