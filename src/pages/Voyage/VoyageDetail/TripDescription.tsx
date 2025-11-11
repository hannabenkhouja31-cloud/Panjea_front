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
            <div class="bg-white rounded-2xl shadow-md p-6">
                <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                    <FileText size={24} class="text-color-main" />
                    Description du voyage
                </h2>
                <Show when={!props.isEditing} fallback={
                    <textarea
                        value={props.editSummary()}
                        onInput={(e) => props.setEditSummary(e.target.value)}
                        class="w-full px-4 py-3 border-2 border-color-main rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main bg-white text-color-dark resize-none"
                        rows={6}
                        placeholder="Décrivez votre voyage..."
                    />
                }>
                    <p class="text-color-dark opacity-80 whitespace-pre-line">
                        {props.summary}
                    </p>
                </Show>
            </div>
        </Show>
    );
};