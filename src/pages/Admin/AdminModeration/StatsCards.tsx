import { AlertTriangle, CheckCircle, BanIcon, Shield } from "lucide-solid";
import type { AdminStats } from "./types";

interface StatsCardsProps {
    stats: AdminStats;
}

export const StatsCards = (props: StatsCardsProps) => {
    return (
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-color-light border-2 border-color-secondary rounded-xl p-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-color-secondary/20 flex items-center justify-center">
                        <AlertTriangle size={24} class="text-color-secondary" />
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-color-dark">{props.stats.pendingCount}</div>
                        <div class="text-sm text-gray-600">En attente</div>
                    </div>
                </div>
            </div>

            <div class="bg-color-light border-2 rounded-xl p-4" style="border-color: #45AF95;">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: rgba(69, 175, 149, 0.2);">
                        <CheckCircle size={24} style="color: #45AF95;" />
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-color-dark">{props.stats.resolvedCount}</div>
                        <div class="text-sm text-gray-600">Résolus</div>
                    </div>
                </div>
            </div>

            <div class="bg-color-light border-2 rounded-xl p-4" style="border-color: #E76F51;">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: rgba(231, 111, 81, 0.2);">
                        <BanIcon size={24} style="color: #E76F51;" />
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-color-dark">{props.stats.bannedUsersCount}</div>
                        <div class="text-sm text-gray-600">Utilisateurs bannis</div>
                    </div>
                </div>
            </div>

            <div class="bg-color-light border-2 border-gray-300 rounded-xl p-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Shield size={24} class="text-gray-600" />
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-color-dark">{props.stats.totalReportsCount}</div>
                        <div class="text-sm text-gray-600">Total signalements</div>
                    </div>
                </div>
            </div>
        </div>
    );
};