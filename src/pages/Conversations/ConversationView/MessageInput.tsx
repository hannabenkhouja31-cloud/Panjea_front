import { Image, Send } from "lucide-solid";
import type { Accessor, Setter } from "solid-js";

interface MessageInputProps {
    messageInput: Accessor<string>;
    setMessageInput: Setter<string>;
    onSend: () => void;
}

export const MessageInput = (props: MessageInputProps) => {
    return (
        <div class="p-2 sm:p-4 border-t-2 border-black bg-white pb-safe-area">
            <div class="flex items-center gap-2 w-full">
                <div class="hidden sm:flex gap-1">
                    <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors" disabled>
                        <Image size={24} class="text-gray-400" />
                    </button>
                </div>

                <input
                    type="text"
                    value={props.messageInput()}
                    onInput={(e) => props.setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && props.onSend()}
                    placeholder="Message..."
                    class="flex-1 min-w-0 px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main transition-colors bg-white text-color-dark text-sm sm:text-base"
                />

                <button
                    onClick={props.onSend}
                    disabled={!props.messageInput().trim()}
                    class="p-2.5 sm:p-3 bg-color-main text-white rounded-xl hover:bg-gradient-main transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 active:scale-95"
                >
                    <Send size={18} class="sm:w-6 sm:h-6" />
                </button>
            </div>
        </div>
    );
};