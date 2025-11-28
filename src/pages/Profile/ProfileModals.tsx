import { For } from "solid-js";
import type { ProfileModalsProps } from "./types";

export const ProfileModals = (props: ProfileModalsProps) => {
    return (
        <>
            <dialog id="travel_types_modal" class="modal modal-bottom sm:modal-middle">
                <div class="modal-box bg-white w-11/12 sm:min-w-3/4 p-4 sm:p-6">
                    <h3 class="text-lg sm:text-2xl font-bold text-color-dark mb-3 sm:mb-4">
                        Sélectionnez vos types de voyage (min. 3)
                    </h3>
                    <div class="py-2 sm:py-4 max-h-[60vh] sm:max-h-[32rem] overflow-y-auto pr-2">
                        <div class="flex flex-wrap gap-2 sm:gap-3">
                            <For each={props.allTravelTypes}>
                                {(tt) => (
                                    <button
                                        type="button"
                                        onClick={() => props.onToggleTravelType(tt.slug)}
                                        class={`px-3 py-2 sm:px-5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all ${
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
                            <button class="btn bg-color-main text-white hover:bg-color-secondary border-none px-4 py-2 sm:px-6 sm:py-3 min-h-0 h-auto">
                                Fermer
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="confirm_save_modal" class="modal modal-bottom sm:modal-middle">
                <div class="modal-box bg-white p-4 sm:p-6">
                    <h3 class="text-lg sm:text-xl font-bold text-color-dark mb-3 sm:mb-4">Confirmer les modifications</h3>
                    <p class="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Êtes-vous sûr de vouloir sauvegarder ces modifications ?</p>
                    <div class="modal-action">
                        <form method="dialog" class="flex gap-3 w-full">
                            <button class="flex-1 btn border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 min-h-0 h-10 sm:h-12">
                                Annuler
                            </button>
                            <button
                                onClick={props.onConfirmSave}
                                class="flex-1 btn bg-color-main text-white hover:bg-color-secondary border-none min-h-0 h-10 sm:h-12"
                            >
                                Confirmer
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="confirm_delete_modal" class="modal modal-bottom sm:modal-middle">
                <div class="modal-box p-4 sm:p-6">
                    <h3 class="font-bold text-base sm:text-lg text-red-600">⚠️ Supprimer votre compte</h3>
                    <p class="py-3 sm:py-4 text-sm sm:text-base">
                        Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
                        Vos voyages et messages resteront visibles mais votre profil sera anonymisé.
                    </p>
                    <div class="modal-action">
                        <form method="dialog" class="flex gap-2 w-full sm:w-auto justify-end">
                            <button class="btn min-h-0 h-10 sm:h-12">Annuler</button>
                            <button
                                class="btn btn-error min-h-0 h-10 sm:h-12"
                                onClick={props.onConfirmDelete}
                            >
                                Supprimer définitivement
                            </button>
                        </form>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
};