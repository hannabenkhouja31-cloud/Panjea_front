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
        <div class="flex-1 overflow-y-auto w-full">
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
                            <p class="text-gray-500 text-sm sm:text-base">Vous n'avez posé aucune question pour le moment</p>
                        </div>
                    }
                >
                    <For each={messagesStore.questionTrips}>
                        {(trip) => (
                            <div
                                onClick={() => handleTripSelect(trip)}
                                class={`p-3 sm:p-4 border-b cursor-pointer transition-colors ${
                                    props.selectedTripId === trip.id
                                        ? "bg-color-main border-color-main"
                                        : "border-gray-200 hover:bg-color-light bg-white"
                                }`}
                            >
                                <div class="flex items-start gap-3">
                                    <img
                                        src={getFirstTripImage(trip)}
                                        alt={trip.title}
                                        class={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 ${
                                            props.selectedTripId === trip.id ? "border-2 border-white" : "border-2 border-black"
                                        }`}
                                    />
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-start justify-between gap-2 mb-1">
                                            <h3 class={`font-bold truncate text-sm sm:text-base ${
                                                props.selectedTripId === trip.id ? "text-white" : "text-color-dark"
                                            }`}>
                                                {trip.title}
                                            </h3>
                                            <Show when={trip.lastMessageDate}>
                                                <span class={`text-[10px] sm:text-xs flex-shrink-0 ${
                                                    props.selectedTripId === trip.id ? "text-white opacity-80" : "text-gray-500"
                                                }`}>
                                                    {formatTime(trip.lastMessageDate)}
                                                </span>
                                            </Show>
                                        </div>
                                        <div class={`relative top-0 sm:top-1 pr-8 text-xs sm:text-sm truncate flex items-center gap-1.5 ${
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
                                                    <div class="min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 px-1 bg-color-secondary rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-medium">
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
    );
};