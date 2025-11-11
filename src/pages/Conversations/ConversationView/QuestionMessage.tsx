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
        <div class="my-4 flex justify-center w-full">
            <div class="w-full max-w-lg p-4 bg-white border-color-secondary rounded-xl">
                <div class="flex items-start gap-3">
                    <div 
                        onClick={() => navigate(`/user/${props.message.sender.id}`)}
                        class="w-10 h-10 rounded-full bg-black border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                    >
                        <Show 
                            when={props.message.sender.profilePictureUrl}
                            fallback={
                                <span class="text-white font-bold text-lg">
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
                    
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <MessageSquare size={16} class="text-color-secondary" />
                            <span class="text-sm font-semibold text-color-secondary">
                                Question de {props.message.sender.username === 'Utilisateur supprimé' ? (
                                    <span class="text-gray-500 italic">{props.message.sender.username}</span>
                                ) : (
                                    props.message.sender.username
                                )}
                            </span>
                        </div>
                        <p class="text-color-dark whitespace-pre-line mb-3">{props.message.content}</p>
                        <Show when={props.isUserTrip}>
                            <button
                                onClick={() => props.onAnswer(props.message.id, props.message.sender.id)}
                                class="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
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