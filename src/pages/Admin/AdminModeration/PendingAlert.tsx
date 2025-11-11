import { Show } from "solid-js";
import { AlertTriangle } from "lucide-solid";

interface PendingAlertProps {
    pendingCount: number;
    filterStatus: 'all' | 'pending' | 'resolved' | 'dismissed';
}

export const PendingAlert = (props: PendingAlertProps) => {
    return (
        <Show when={props.filterStatus === 'pending' && props.pendingCount > 0}>
            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div class="flex items-center gap-3">
                    <AlertTriangle size={20} class="text-yellow-600" />
                    <p class="text-sm text-yellow-800">
                        <span class="font-semibold">{props.pendingCount} signalement{props.pendingCount > 1 ? 's' : ''}</span> en attente de traitement
                    </p>
                </div>
            </div>
        </Show>
    );
};