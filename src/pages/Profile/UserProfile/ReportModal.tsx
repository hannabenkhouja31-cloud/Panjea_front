import { Show } from "solid-js";
import type { ReportModalProps } from "./types";

export const ReportModal = (props: ReportModalProps) => {
    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={props.onClose}>
                <div class="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <h3 class="text-xl font-bold text-color-dark mb-4">Signaler ce profil</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Raison du signalement</label>
                            <select
                                value={props.reportReason}
                                onChange={(e) => props.onReasonChange(e.target.value)}
                                class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main"
                            >
                                <option value="">Sélectionnez une raison</option>
                                <option value="spam">Spam ou publicité</option>
                                <option value="harassment">Harcèlement</option>
                                <option value="inappropriate">Contenu inapproprié</option>
                                <option value="fake">Faux profil</option>
                                <option value="scam">Arnaque</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={props.reportDescription}
                                onInput={(e) => props.onDescriptionChange(e.currentTarget.value)}
                                placeholder="Décrivez le problème..."
                                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main resize-none"
                                rows={4}
                            />
                        </div>
                    </div>

                    <div class="flex gap-3 mt-6">
                        <button
                            onClick={props.onClose}
                            disabled={props.isSending}
                            class="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={props.onSubmit}
                            disabled={!props.reportReason || !props.reportDescription.trim() || props.isSending}
                            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Show when={!props.isSending} fallback={<span class="loading loading-spinner loading-sm"></span>}>
                                Envoyer
                            </Show>
                        </button>
                    </div>
                </div>
            </div>
        </Show>
    );
};