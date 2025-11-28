import { Show, type Accessor, type Setter } from "solid-js";
import { FileText } from "lucide-solid";

interface TripDescriptionProps {
    summary?: string;
    isEditing: boolean;
    editSummary: Accessor<string>;
    setEditSummary: Setter<string>;
}

export const TripDescription = (props: TripDescriptionProps) => {
    return (
        <Show when={props.summary || props.isEditing}>
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6">
                <h2 class="text-lg sm:text-xl font-bold text-color-dark flex items-center gap-2 mb-3 sm:mb-4">
                    <FileText size={20} class="sm:w-6 sm:h-6 text-color-main" />
                    Description du voyage
                </h2>
                <Show when={!props.isEditing} fallback={
                    <textarea
                        value={props.editSummary()}
                        onInput={(e) => props.setEditSummary(e.target.value)}
                        class="w-full px-3 py-3 sm:px-4 border-2 border-color-main rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main bg-white text-color-dark resize-none text-sm sm:text-base"
                        rows={6}
                        placeholder="Décrivez votre voyage..."
                    />
                }>
                    <p class="text-color-dark opacity-80 whitespace-pre-line text-sm sm:text-base">
                        {props.summary}
                    </p>
                </Show>
            </div>
        </Show>
    );
};