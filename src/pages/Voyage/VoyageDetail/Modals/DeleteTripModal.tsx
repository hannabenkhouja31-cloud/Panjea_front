import { Show, type Accessor } from "solid-js";

interface DeleteTripModalProps {
    isDeleting: Accessor<boolean>;
    onConfirm: () => void;
}

export const DeleteTripModal = (props: DeleteTripModalProps) => {
    return (
        <dialog id="confirm_delete_trip_modal" class="modal">
            <div class="modal-box bg-white">
                <h3 class="font-bold text-xl text-red-600 mb-4">Supprimer ce voyage ?</h3>
                <p class="py-4 text-gray-700">
                    Êtes-vous sûr de vouloir supprimer ce voyage ? Cette action est irréversible.
                    Tous les messages, photos et membres associés seront supprimés.
                </p>
                <div class="modal-action">
                    <form method="dialog" class="flex gap-2">
                        <button class="btn" disabled={props.isDeleting()}>Annuler</button>
                        <button 
                            class="btn btn-error"
                            onClick={props.onConfirm}
                            disabled={props.isDeleting()}
                        >
                            <Show when={!props.isDeleting()} fallback={<span class="loading loading-spinner loading-sm"></span>}>
                                Supprimer définitivement
                            </Show>
                        </button>
                    </form>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button disabled={props.isDeleting()}>close</button>
            </form>
        </dialog>
    );
};