import { Show } from "solid-js";
import { MessageSquare } from "lucide-solid";
import { useNavigate } from "@solidjs/router";
import type { Message } from "../types";
import { AskerUsername } from "../AskerUsername";

interface AnswerMessageProps {
    message: Message;
}

export const AnswerMessage = (props: AnswerMessageProps) => {
    const navigate = useNavigate();

    return (
        <div class="my-4 flex justify-center w-full">
            <div class="w-full max-w-lg p-4 border-2 border-color-main rounded-xl">
                <div class="flex items-start gap-3">
                    <div 
                        onClick={() => navigate(`/user/${props.message.sender.id}`)}
                        class="w-10 h-10 rounded-full bg-color-main border-2 border-color-main flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
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
                    
                    <div class="truncate">
                        <div class="flex items-center gap-2 mb-1 ">
                            <MessageSquare size={16} class="text-black" />
                            <span class="flex text-sm font-semibold text-black">
                                Votre réponse à&nbsp;<AskerUsername askerId={props.message.questionData?.askerId} />
                            </span>
                        </div>
                        
                        <p class="italic text-color-dark truncate-text">"{props.message.content}"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};