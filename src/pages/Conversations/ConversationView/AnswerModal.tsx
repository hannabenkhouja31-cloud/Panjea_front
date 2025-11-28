import { Show } from "solid-js";
import { X } from "lucide-solid";
import type { Accessor, Setter } from "solid-js";

interface AnswerModalProps {
    answerText: Accessor<string>;
    setAnswerText: Setter<string>;
    isSending: Accessor<boolean>;
    onSend: () => void;
}

export const AnswerModal = (props: AnswerModalProps) => {
    return (
        <dialog id="answer_question_modal" class="modal modal-bottom sm:modal-middle">
            <div class="modal-box w-full sm:max-w-lg bg-white p-4 sm:p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-xl sm:text-2xl text-color-dark">Répondre à la question</h3>
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost">
                            <X size={20} />
                        </button>
                    </form>
                </div>

                <textarea
                    value={props.answerText()}
                    onInput={(e) => props.setAnswerText(e.currentTarget.value)}
                    class="w-full px-3 py-3 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main transition-colors bg-white text-color-dark resize-none text-base"
                    rows={5}
                    placeholder="Écrivez votre réponse..."
                    disabled={props.isSending()}
                />

                <div class="modal-action mt-4 sm:mt-6">
                    <form method="dialog">
                        <button class="btn btn-ghost" disabled={props.isSending()}>Annuler</button>
                    </form>
                    <button
                        class="btn bg-color-main text-white hover:bg-gradient-main border-0 px-6"
                        onClick={props.onSend}
                        disabled={!props.answerText().trim() || props.isSending()}
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