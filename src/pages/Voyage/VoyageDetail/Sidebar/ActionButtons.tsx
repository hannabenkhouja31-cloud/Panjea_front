import { Show, type Accessor } from "solid-js";
import { A } from "@solidjs/router";
import { Users, MessageCircle, Edit, X, Check } from "lucide-solid";

interface ActionButtonsProps {
    isUserTrip: boolean;
    isEditing: boolean;
    hasChanges: Accessor<boolean>;
    memberStatus: Accessor<string | null>;
    isRequesting: Accessor<boolean>;
    onRequestToJoin: () => void;
    onAskQuestion: () => void;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onDelete: () => void;
}

export const ActionButtons = (props: ActionButtonsProps) => {
    return (
        <div class="flex flex-col gap-3 sm:gap-4">
            <Show when={!props.isUserTrip}>
                <Show
                    when={props.memberStatus() === null}
                    fallback={
                        <Show when={props.memberStatus() === 'PENDING'}>
                            <button class="flex-1 bg-gray-300 text-gray-600 py-3 rounded-xl font-semibold cursor-not-allowed text-sm sm:text-base" disabled>
                                Demande en attente
                            </button>
                        </Show>
                    }
                >
                    <button
                        onClick={props.onRequestToJoin}
                        disabled={props.isRequesting()}
                        class="flex-1 bg-color-main text-white py-3 rounded-xl font-semibold hover:bg-gradient-main transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <Show when={!props.isRequesting()} fallback={<span class="loading loading-spinner loading-sm"></span>}>
                            <>
                                <Users size={18} class="sm:w-5 sm:h-5" />
                                Demander à participer
                            </>
                        </Show>
                    </button>
                </Show>
            </Show>

            <Show when={!props.isUserTrip}>
                <button
                    onClick={props.onAskQuestion}
                    class="flex-1 border-2 border-color-main text-color-main py-3 rounded-xl font-semibold hover:bg-color-light transition-all hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <MessageCircle size={18} class="sm:w-5 sm:h-5" />
                    Poser une question
                </button>
            </Show>

            <Show when={props.isUserTrip && !props.isEditing}>
                <button
                    onClick={props.onEdit}
                    class="w-full bg-color-main hover:bg-gradient-main text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg active:scale-95 mb-2 sm:mb-3 text-sm sm:text-base"
                >
                    <Edit size={18} class="sm:w-5 sm:h-5" />
                    Modifier
                </button>
                <A href={"/conversations"}
                   class="w-full border-2 border-gray-300 text-color-dark py-3 rounded-xl font-semibold hover:bg-color-light hover:border-[#146865] transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-md active:scale-95 mb-2 sm:mb-3 text-sm sm:text-base">
                    <MessageCircle size={18} class="sm:w-5 sm:h-5" />
                    Voir les questions
                </A>
                <button
                    onClick={props.onDelete}
                    class="w-full border-2 border-red-500 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <X size={18} class="sm:w-5 sm:h-5" />
                    Supprimer le voyage
                </button>
            </Show>

            <Show when={props.isUserTrip && props.isEditing}>
                <button
                    onClick={props.onCancel}
                    class="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base"
                >
                    <X size={18} class="sm:w-5 sm:h-5" />
                    Annuler
                </button>
                <button
                    onClick={props.onSave}
                    disabled={!props.hasChanges()}
                    class={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                        props.hasChanges()
                            ? 'bg-color-main text-white hover:bg-gradient-main hover:scale-105 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <Check size={18} class="sm:w-5 sm:h-5" />
                    Sauvegarder
                </button>
            </Show>
        </div>
    );
};