import { Show } from "solid-js";
import type { Message } from "../types";
import { formatTime } from "../utils";
import { user } from "../../../stores/userStore";

interface RegularMessageProps {
    message: Message;
}

export const RegularMessage = (props: RegularMessageProps) => {
    const isMine = props.message.sender.id === user.profile?.id;

    return (
        <div class={`flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2 mb-3 sm:mb-4 px-2 sm:px-4`}>
            <Show when={!isMine}>
                <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Show
                        when={props.message.sender.profilePictureUrl}
                        fallback={
                            <span class="text-white font-bold text-xs sm:text-sm">
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
            </Show>
            <div class="relative max-w-[85%] sm:max-w-md">
                <div class={`${isMine ? "bg-color-main text-white" : "bg-gray-200 text-color-dark"} rounded-2xl px-3 py-2 sm:px-4 sm:py-3`}>
                    <Show when={!isMine}>
                        <p class="font-semibold text-[10px] sm:text-xs mb-1">
                            {props.message.sender.username === 'Utilisateur supprimé' ? (
                                <span class="text-gray-500 italic">{props.message.sender.username}</span>
                            ) : (
                                props.message.sender.username
                            )}
                        </p>
                    </Show>
                    <p class="whitespace-pre-line text-sm sm:text-base">{props.message.content}</p>
                    <div class="flex items-center justify-end gap-1 mt-1">
                        <span class={`text-[10px] sm:text-xs ${isMine ? "text-white opacity-70" : "text-gray-500"}`}>
                            {formatTime(props.message.createdAt)}
                        </span>
                    </div>
                </div>
                <Show when={!isMine}>
                    <div
                        class="absolute -rotate-45 -bottom-[8px] -left-[2px] w-0 h-0"
                        style={{
                            "border-top": "12px solid transparent",
                            "border-bottom": "12px solid transparent",
                            "border-right": "12px solid rgb(228, 228, 228)"
                        }}
                    />
                </Show>
                <Show when={isMine}>
                    <div
                        class="absolute rotate-45 -bottom-[8px] -right-[2px] w-2 h-2"
                        style={{
                            "border-top": "12px solid transparent",
                            "border-bottom": "12px solid transparent",
                            "border-left": "12px solid #146865"
                        }}
                    />
                </Show>
            </div>
        </div>
    );
};