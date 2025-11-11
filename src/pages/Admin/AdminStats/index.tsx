import { TrendingUp } from "lucide-solid";

export const AdminStats = () => {
    return (
        <div class="flex flex-col items-center justify-center py-12">
            <TrendingUp size={64} class="text-gray-300 mb-4" />
            <h3 class="text-xl font-semibold text-gray-400 mb-2">Statistiques à venir</h3>
            <p class="text-gray-500 text-center max-w-md">
                Les statistiques de la plateforme seront disponibles prochainement
            </p>
        </div>
    );
};