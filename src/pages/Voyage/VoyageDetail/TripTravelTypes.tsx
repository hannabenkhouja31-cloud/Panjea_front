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
            <div class="bg-white rounded-2xl shadow-md p-6">
                <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                    <Compass size={24} class="text-color-main" />
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
                                            <div class="flex items-center gap-2 px-3 py-2 rounded-full bg-color-main text-white text-sm font-medium">
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
                            class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-color-main transition cursor-pointer flex items-center justify-center gap-2 text-gray-500 hover:text-color-main"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Modifier les types de voyage</span>
                        </button>
                    </div>
                }>
                    <div class="flex flex-wrap gap-3">
                        <For each={props.travelTypes}>
                            {(slug: string) => (
                                <div class="inline-flex items-center bg-color-light text-color-main rounded-xl px-4 py-3 font-medium">
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