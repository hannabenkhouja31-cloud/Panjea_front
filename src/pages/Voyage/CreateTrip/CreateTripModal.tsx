import { For } from "solid-js";

interface CreateTripModalProps {
    selectedTravelTypes: string[];
    travelTypes: Array<{ id: number; slug: string; label: string }>;
    toggleTravelType: (slug: string) => void;
}

export const CreateTripModal = (props: CreateTripModalProps) => {
    return (
        <dialog id="trip_travel_types_modal" class="modal modal-bottom sm:modal-middle">
            <div class="modal-box bg-white w-full sm:min-w-3/4 p-4 sm:p-6">
                <h3 class="text-xl sm:text-2xl font-bold text-color-dark mb-3 sm:mb-4">
                    Sélectionnez vos types de voyage (min. 3)
                </h3>
                <div class="py-2 sm:py-4 max-h-[60vh] sm:max-h-[32rem] overflow-y-auto pr-1 sm:pr-2">
                    <div class="flex flex-wrap gap-2 sm:gap-3">
                        <For each={props.travelTypes}>
                            {(tt) => (
                                <button
                                    type="button"
                                    onClick={() => props.toggleTravelType(tt.slug)}
                                    class={`px-3 py-2 sm:px-5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all ${
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
                <div class="modal-action mt-4 sm:mt-6">
                    <form method="dialog">
                        <button class="btn bg-color-main text-white hover:bg-color-secondary border-none px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base h-auto min-h-0">
                            Fermer
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default CreateTripModal;