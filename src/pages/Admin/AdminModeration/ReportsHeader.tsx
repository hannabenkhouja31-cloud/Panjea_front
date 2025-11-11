import { Filter } from "lucide-solid";
import type { Accessor, Setter } from "solid-js";

interface ReportsHeaderProps {
    filterStatus: Accessor<'all' | 'pending' | 'resolved' | 'dismissed'>;
    setFilterStatus: Setter<'all' | 'pending' | 'resolved' | 'dismissed'>;
    pendingCount: number;
}

export const ReportsHeader = (props: ReportsHeaderProps) => {
    return (
        <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-color-dark">Signalements</h2>
                <div class="flex items-center gap-2">
                    <Filter size={18} class="text-gray-500" />
                    <select
                        value={props.filterStatus()}
                        onChange={(e) => props.setFilterStatus(e.currentTarget.value as any)}
                        class="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-color-main"
                    >
                        <option value="pending">En attente ({props.pendingCount})</option>
                        <option value="all">Tous</option>
                        <option value="resolved">Résolus</option>
                        <option value="dismissed">Rejetés</option>
                    </select>
                </div>
            </div>
        </div>
    );
};