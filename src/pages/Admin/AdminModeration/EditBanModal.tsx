import { Show, createEffect, type Accessor, type Setter } from "solid-js";
import AirDatepicker from "air-datepicker";
import "air-datepicker/air-datepicker.css";
import localeFr from "air-datepicker/locale/fr";
import type { Report } from "./types";

interface EditBanModalProps {
    isOpen: Accessor<boolean>;
    onClose: () => void;
    selectedReport: Accessor<Report | null>;
    isPermanentBan: Accessor<boolean>;
    setIsPermanentBan: Setter<boolean>;
    banEndDate: Accessor<string>;
    setBanEndDate: Setter<string>;
    onConfirm: () => void;
    isProcessing: Accessor<boolean>;
    calculateDuration: () => number | null;
}

export const EditBanModal = (props: EditBanModalProps) => {
    let editBanDateInput: HTMLInputElement | undefined;
    let editBanDatePicker: AirDatepicker<HTMLInputElement> | undefined;

    createEffect(() => {
        if (props.isOpen() && editBanDateInput && !editBanDatePicker) {
            setTimeout(() => {
                if (editBanDateInput) {
                    editBanDatePicker = new AirDatepicker(editBanDateInput, {
                        locale: localeFr,
                        dateFormat: 'yyyy-MM-dd',
                        minDate: new Date(),
                        selectedDates: props.banEndDate() ? [new Date(props.banEndDate())] : [],
                        onSelect: ({ formattedDate }) => {
                            if (formattedDate) {
                                const newDate = Array.isArray(formattedDate) ? formattedDate[0] : formattedDate;
                                props.setBanEndDate(newDate);
                            }
                        }
                    });
                }
            }, 100);
        }

        if (!props.isOpen() && editBanDatePicker) {
            editBanDatePicker.destroy();
            editBanDatePicker = undefined;
        }
    });

    return (
        <Show when={props.isOpen()}>
            <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={props.onClose}>
                <div class="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <h3 class="text-xl font-bold text-orange-600 mb-4">Modifier le ban</h3>
                    
                    <div class="mb-4 p-4 bg-gray-50 rounded-xl">
                        <p class="text-sm text-gray-600 mb-1">Utilisateur</p>
                        <p class="font-bold text-color-dark">{props.selectedReport()?.reportedUser.username}</p>
                    </div>

                    <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p class="text-sm text-red-700">
                            <span class="font-semibold">Raison actuelle :</span> {props.selectedReport()?.reportedUser.bannedReason}
                        </p>
                        <Show when={props.selectedReport()?.reportedUser.bannedUntil}>
                            <p class="text-sm text-red-700 mt-1">
                                <span class="font-semibold">Expire le :</span> {new Date(props.selectedReport()!.reportedUser.bannedUntil!).toLocaleDateString('fr-FR')}
                            </p>
                        </Show>
                        <Show when={!props.selectedReport()?.reportedUser.bannedUntil}>
                            <p class="text-sm text-red-700 mt-1 font-semibold">Ban permanent</p>
                        </Show>
                    </div>

                    <div class="mb-4">
                        <label class="flex items-center gap-2 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                checked={props.isPermanentBan()}
                                onChange={(e) => props.setIsPermanentBan(e.currentTarget.checked)}
                                class="w-5 h-5 rounded border-gray-300 text-color-main focus:ring-color-main"
                            />
                            <span class="text-sm font-semibold text-gray-700">Changer en ban permanent</span>
                        </label>

                        <Show when={!props.isPermanentBan()}>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Nouvelle date de fin
                                </label>
                                <input
                                    ref={editBanDateInput}
                                    type="text"
                                    placeholder="Choisir une date"
                                    readonly
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl cursor-pointer focus:outline-none focus:border-color-main"
                                />
                                <Show when={props.calculateDuration()}>
                                    <p class="text-sm text-gray-600 mt-2">
                                        Durée: {props.calculateDuration()} jour{props.calculateDuration()! > 1 ? 's' : ''}
                                    </p>
                                </Show>
                            </div>
                        </Show>
                    </div>

                    <div class="flex gap-3">
                        <button
                            onClick={props.onClose}
                            disabled={props.isProcessing()}
                            class="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={props.onConfirm}
                            disabled={(!props.isPermanentBan() && !props.banEndDate()) || props.isProcessing()}
                            class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Show when={!props.isProcessing()} fallback={<span class="loading loading-spinner loading-sm"></span>}>
                                Confirmer les modifications
                            </Show>
                        </button>
                    </div>
                </div>
            </div>
        </Show>
    );
};