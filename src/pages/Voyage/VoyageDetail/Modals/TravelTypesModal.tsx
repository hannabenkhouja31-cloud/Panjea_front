import { For } from "solid-js";

interface TravelTypesModalProps {
    editTravelTypes: string[];
    allTravelTypes: any[];
    onToggle: (slug: string) => void;
    ref: (el: HTMLDialogElement) => void;
}

export const TravelTypesModal = (props: TravelTypesModalProps) => {
    return (
        <dialog id="edit_trip_travel_types_modal" ref={props.ref} class="modal">
            <div class="modal-box max-w-4xl bg-white">
                <h3 class="font-bold text-2xl text-color-dark mb-6">Choisissez vos types de voyage</h3>
                <p class="text-gray-600 mb-6">Sélectionnez au moins 3 types correspondant à votre aventure</p>
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                    <For each={props.allTravelTypes}>
                        {(type) => (
                            <button
                                type="button"
                                onClick={() => props.onToggle(type.slug)}
                                class={`p-4 rounded-xl font-medium transition text-left ${
                                    props.editTravelTypes.includes(type.slug)
                                        ? 'bg-color-main text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {type.label}
                            </button>
                        )}
                    </For>
                </div>

                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn bg-color-main text-white hover:bg-gradient-main border-0">
                            Confirmer ({props.editTravelTypes.length})
                        </button>
                    </form>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
};