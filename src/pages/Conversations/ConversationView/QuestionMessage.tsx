import { Show } from "solid-js";
import { MessageSquare } from "lucide-solid";
import { useNavigate } from "@solidjs/router";
import type { Message } from "../types";

interface QuestionMessageProps {
    message: Message;
    isUserTrip: boolean;
    onAnswer: (messageId: string, askerId: string) => void;
}

export const QuestionMessage = (props: QuestionMessageProps) => {
    const navigate = useNavigate();

    return (
        <div class="my-3 sm:my-4 flex justify-center w-full px-2 sm:px-0">
            <div class="w-full max-w-[95%] sm:max-w-lg p-3 sm:p-4 bg-white border-color-secondary rounded-xl">
                <div class="flex items-start gap-2 sm:gap-3">
                    <div
                        onClick={() => navigate(`/user/${props.message.sender.id}`)}
                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                    >
                        <Show
                            when={props.message.sender.profilePictureUrl}
                            fallback={
                                <span class="text-white font-bold text-sm sm:text-lg">
                                    {props.message.sender.username[0].toUpperCase()}
                                </span>
                            }
                        >
                            <img
                                src={props.message.sender.profilePictureUrl}
                                alt={props.message.sender.username}
                                class="w-full h-full object-cover"
                            />
                        </Show>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <MessageSquare size={14} class="text-color-secondary flex-shrink-0 sm:w-4 sm:h-4" />
                            <span class="text-xs sm:text-sm font-semibold text-color-secondary truncate">
                                Question de {props.message.sender.username === 'Utilisateur supprimé' ? (
                                <span class="text-gray-500 italic">{props.message.sender.username}</span>
                            ) : (
                                props.message.sender.username
                            )}
                            </span>
                        </div>
                        <p class="text-color-dark whitespace-pre-line mb-3 text-sm sm:text-base">{props.message.content}</p>
                        <Show when={props.isUserTrip}>
                            <button
                                onClick={() => props.onAnswer(props.message.id, props.message.sender.id)}
                                class="bg-black text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors w-full sm:w-auto"
                            >
                                Répondre
                            </button>
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    );
};