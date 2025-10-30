import { For } from "solid-js";
import { Compass } from "lucide-solid";

interface CreateTripStep4Props {
    currentStep: number;
    selectedTravelTypes: string[];
    travelTypes: Array<{ id: number; slug: string; label: string }>;
    toggleTravelType: (slug: string) => void;
}

export const CreateTripStep4 = (props: CreateTripStep4Props) => {
    return (
        <div class="w-full max-w-2xl mx-auto">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <Compass size={32} class="text-color-success" />
                    <h3 class="text-2xl font-bold text-color-dark">Types de voyage</h3>
                </div>
                <span class="text-gray-500 font-medium">Étape {props.currentStep}/5</span>
            </div>
            
            <div>
                <p class="text-center text-gray-600 mb-6 text-lg">
                    Sélectionnez au moins 3 types de voyage qui correspondent à votre aventure
                </p>

                {props.selectedTravelTypes.length > 0 && (
                    <div class="flex flex-wrap gap-2 mb-6 justify-center">
                        <For each={props.selectedTravelTypes}>
                            {(slug) => {
                                const tt = props.travelTypes.find(t => t.slug === slug);
                                return (
                                    <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-color-secondary text-white text-sm font-medium">
                                        <span>{tt?.label}</span>
                                        <button
                                            type="button"
                                            onClick={() => props.toggleTravelType(slug)}
                                            class="flex items-center justify-center w-4 h-4 rounded-full hover:bg-white hover:bg-opacity-20 transition"
                                        >
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            }}
                        </For>
                    </div>
                )}

                <button
                    type="button"
                    onclick={() => {
                        const modal = document.getElementById('trip_travel_types_modal') as HTMLDialogElement;
                        modal?.showModal();
                    }}
                    class="w-full px-5 py-6 text-lg border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-color-main transition cursor-pointer flex items-center justify-center gap-2 text-gray-500 hover:text-color-main"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Choisir vos types de voyage</span>
                </button>
            </div>
        </div>
    );
};

export default CreateTripStep4;