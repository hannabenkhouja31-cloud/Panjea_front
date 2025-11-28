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
        <div class="my-3 sm:my-4 flex justify-center w-full px-2 sm:px-0">
            <div class="w-full max-w-[95%] sm:max-w-lg p-3 sm:p-4 border-2 border-color-main rounded-xl">
                <div class="flex items-start gap-2 sm:gap-3">
                    <div
                        onClick={() => navigate(`/user/${props.message.sender.id}`)}
                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-color-main border-2 border-color-main flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
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

                    <div class="truncate flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <MessageSquare size={14} class="text-black flex-shrink-0 sm:w-4 sm:h-4" />
                            <span class="flex text-xs sm:text-sm font-semibold text-black truncate">
                                Votre réponse à&nbsp;<AskerUsername askerId={props.message.questionData?.askerId} />
                            </span>
                        </div>

                        <p class="italic text-color-dark truncate-text text-sm sm:text-base">"{props.message.content}"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};