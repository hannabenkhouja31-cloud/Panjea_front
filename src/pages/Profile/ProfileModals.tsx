import { For } from "solid-js";

interface ProfileModalsProps {
    editTravelTypes: string[];
    allTravelTypes: Array<{ id: number; slug: string; label: string }>;
    onToggleTravelType: (slug: string) => void;
    onConfirmSave: () => void;
}

export const ProfileModals = (props: ProfileModalsProps) => {
    return (
        <>
            <dialog id="travel_types_modal" class="modal modal-bottom sm:modal-middle">
                <div class="modal-box bg-white min-w-3/4 w-full">
                    <h3 class="text-2xl font-bold text-color-dark mb-4">
                        Sélectionnez vos types de voyage (min. 3)
                    </h3>
                    <div class="py-4 max-h-[32rem] overflow-y-auto pr-2">
                        <div class="flex flex-wrap gap-3">
                            <For each={props.allTravelTypes}>
                                {(tt) => (
                                    <button
                                        type="button"
                                        onClick={() => props.onToggleTravelType(tt.slug)}
                                        class={`px-5 py-3 rounded-full text-base font-medium transition-all ${
                                            props.editTravelTypes.includes(tt.slug)
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

            <dialog id="confirm_save_modal" class="modal">
                <div class="modal-box bg-white">
                    <h3 class="text-xl font-bold text-color-dark mb-4">Confirmer les modifications</h3>
                    <p class="text-gray-600 mb-6">Êtes-vous sûr de vouloir sauvegarder ces modifications ?</p>
                    <div class="modal-action">
                        <form method="dialog" class="flex gap-3 w-full">
                            <button class="flex-1 btn border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                                Annuler
                            </button>
                            <button 
                                onClick={props.onConfirmSave}
                                class="flex-1 btn bg-color-main text-white hover:bg-color-secondary border-none"
                            >
                                Confirmer
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default ProfileModals;