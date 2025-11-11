import { Show, type Accessor, type Setter } from "solid-js";
import { X } from "lucide-solid";

interface AskQuestionModalProps {
    questionText: Accessor<string>;
    setQuestionText: Setter<string>;
    isSending: Accessor<boolean>;
    status: Accessor<{ message: string, type: 'success' | 'error' | '' }>;
    onSend: () => void;
}

export const AskQuestionModal = (props: AskQuestionModalProps) => {
    return (
        <dialog id="ask_question_modal" class="modal">
            <div class="modal-box max-w-lg bg-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-2xl text-color-dark">Poser une question</h3>
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost">
                            <X size={20} />
                        </button>
                    </form>
                </div>
                <p class="text-gray-600 mb-6">
                    Votre question sera envoyée à l'organisateur. Vous pourrez voir sa réponse sur cette page.
                </p>
                
                <textarea
                    value={props.questionText()}
                    onInput={(e) => props.setQuestionText(e.currentTarget.value)}
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main transition-colors bg-white text-color-dark resize-none"
                    rows={5}
                    placeholder="Écrivez votre question ici..."
                    disabled={props.isSending()}
                />

                <Show when={props.status().message}>
                    <div class={`mt-4 text-sm text-center font-semibold p-3 rounded-lg ${
                        props.status().type === 'success' ? 'bg-color-main text-white' : 'bg-red-100 text-red-700'
                    }`}>
                        {props.status().message}
                    </div>
                </Show>

                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn btn-ghost" disabled={props.isSending()}>Annuler</button>
                    </form>
                    <button
                        class="btn bg-color-main text-white hover:bg-gradient-main border-0"
                        onClick={props.onSend}
                        disabled={!props.questionText().trim() || props.isSending()}
                    >
                        <Show when={!props.isSending()} fallback={<span class="loading loading-spinner loading-sm"></span>}>
                            Envoyer
                        </Show>
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
};