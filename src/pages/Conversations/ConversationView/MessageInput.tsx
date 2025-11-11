import { Image, Send } from "lucide-solid";
import type { Accessor, Setter } from "solid-js";

interface MessageInputProps {
    messageInput: Accessor<string>;
    setMessageInput: Setter<string>;
    onSend: () => void;
}

export const MessageInput = (props: MessageInputProps) => {
    return (
        <div class="p-4 border-t-2 border-black">
            <div class="flex items-center gap-3">
                <div class="flex gap-2">
                    <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors" disabled>
                        <Image size={24} class="text-gray-400" />
                    </button>
                </div>
                <input
                    type="text"
                    value={props.messageInput()}
                    onInput={(e) => props.setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && props.onSend()}
                    placeholder="Écrivez votre message..."
                    class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main transition-colors bg-white text-color-dark"
                />
                <button
                    onClick={props.onSend}
                    disabled={!props.messageInput().trim()}
                    class="p-3 bg-color-main text-white rounded-xl hover:bg-gradient-main transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={24} />
                </button>
            </div>
        </div>
    );
};