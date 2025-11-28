import { Show, For, type Accessor } from "solid-js";
import { Compass } from "lucide-solid";
import { getTravelTypeLabel } from "./utils";

interface TripTravelTypesProps {
    travelTypes: string[];
    isEditing: boolean;
    editTravelTypes: Accessor<string[]>;
    allTravelTypes: any[];
    onOpenModal: () => void;
}

export const TripTravelTypes = (props: TripTravelTypesProps) => {
    return (
        <Show when={props.travelTypes?.length > 0 || props.isEditing}>
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6">
                <h2 class="text-lg sm:text-xl font-bold text-color-dark flex items-center gap-2 mb-3 sm:mb-4">
                    <Compass size={20} class="sm:w-6 sm:h-6 text-color-main" />
                    Types de voyage
                </h2>
                <Show when={!props.isEditing} fallback={
                    <div>
                        <Show when={props.editTravelTypes().length > 0}>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <For each={props.editTravelTypes()}>
                                    {(slug) => {
                                        const tt = props.allTravelTypes.find(t => t.slug === slug);
                                        return (
                                            <div class="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3 sm:py-2 rounded-full bg-color-main text-white text-xs sm:text-sm font-medium">
                                                <span>{tt?.label}</span>
                                            </div>
                                        );
                                    }}
                                </For>
                            </div>
                        </Show>
                        <button
                            type="button"
                            onclick={props.onOpenModal}
                            class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-color-main transition cursor-pointer flex items-center justify-center gap-2 text-gray-500 hover:text-color-main text-sm sm:text-base"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Modifier les types de voyage</span>
                        </button>
                    </div>
                }>
                    <div class="flex flex-wrap gap-2 sm:gap-3">
                        <For each={props.travelTypes}>
                            {(slug: string) => (
                                <div class="inline-flex items-center bg-color-light text-color-main rounded-xl px-3 py-2 sm:px-4 sm:py-3 font-medium text-sm sm:text-base">
                                    {getTravelTypeLabel(slug)}
                                </div>
                            )}
                        </For>
                    </div>
                </Show>
            </div>
        </Show>
    );
};