import { For } from "solid-js";

interface CreateTripModalProps {
    selectedTravelTypes: string[];
    travelTypes: Array<{ id: number; slug: string; label: string }>;
    toggleTravelType: (slug: string) => void;
}

export const CreateTripModal = (props: CreateTripModalProps) => {
    return (
        <dialog id="trip_travel_types_modal" class="modal modal-bottom sm:modal-middle">
            <div class="modal-box bg-white min-w-3/4 w-full">
                <h3 class="text-2xl font-bold text-color-dark mb-4">
                    Sélectionnez vos types de voyage (min. 3)
                </h3>
                <div class="py-4 max-h-[32rem] overflow-y-auto pr-2">
                    <div class="flex flex-wrap gap-3">
                        <For each={props.travelTypes}>
                            {(tt) => (
                                <button
                                    type="button"
                                    onClick={() => props.toggleTravelType(tt.slug)}
                                    class={`px-5 py-3 rounded-full text-base font-medium transition-all ${
                                        props.selectedTravelTypes.includes(tt.slug)
                                            ? 'bg-color-secondary text-white border-2 border-color-secondary'
                                            : 'border border-gray-300 bg-white text-color-dark hover:border-gray-400'
                                    }`}
                                >
                                    {tt.label}
                                </button>
                            )}
                        </For>
                    </div>
                </div>
                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn bg-color-main text-white hover:bg-color-secondary border-none px-6 py-3">
                            Fermer
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default CreateTripModal;