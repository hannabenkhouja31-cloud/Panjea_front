import { createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Ban, Clock, Calendar, AlertTriangle } from "lucide-solid";
import { logout } from "../../stores/userStore";
import { getNeonApp } from "../../stores/configStore";

export const BannedPage = () => {
    const navigate = useNavigate();
    const [bannedInfo, setBannedInfo] = createSignal<{
        reason: string;
        bannedAt: string;
        bannedUntil?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = createSignal(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    onMount(async () => {
        const neonApp = getNeonApp();
        const neonUser = await neonApp?.getUser();

        if (!neonUser) {
            navigate("/connexion", { replace: true });
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/users/${neonUser.id}`);
            
            if (response.ok) {
                const userData = await response.json();
                
                if (userData.isBanned) {
                    setBannedInfo({
                        reason: userData.bannedReason,
                        bannedAt: userData.bannedAt,
                        bannedUntil: userData.bannedUntil,
                    });
                } else {
                    navigate("/", { replace: true });
                }
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des infos de ban:", error);
        } finally {
            setIsLoading(false);
        }
    });

    const calculateRemainingDays = () => {
        if (!bannedInfo()?.bannedUntil) return null;
        
        const end = new Date(bannedInfo()!.bannedUntil!);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return days > 0 ? days : 0;
    };

    const handleLogout = async () => {
        const neonApp = getNeonApp();
        // @ts-expect-error Stack Auth signOut exists but not in types
        await neonApp?.signOut();
        logout();
        navigate("/connexion", { replace: true });
    };

    return (
        <div class="flex items-center justify-center min-h-screen bg-color-light">
            <Show
                when={!isLoading()}
                fallback={
                    <span class="loading loading-spinner loading-lg text-color-main"></span>
                }
            >
                <div class="max-w-2xl w-full mx-4">
                    <div class="bg-white rounded-2xl shadow-lg p-8">
                        <div class="flex flex-col items-center text-center mb-8">
                            <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                                <Ban size={48} class="text-red-600" />
                            </div>
                            <h1 class="text-3xl font-bold text-red-600 mb-2">
                                Compte suspendu
                            </h1>
                            <p class="text-gray-600">
                                Votre compte Panjéa a été temporairement suspendu
                            </p>
                        </div>

                        <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                            <div class="flex items-start gap-3 mb-4">
                                <AlertTriangle size={24} class="text-red-600 flex-shrink-0 mt-1" />
                                <div class="flex-1">
                                    <h3 class="font-bold text-red-900 mb-2">Raison de la suspension</h3>
                                    <p class="text-red-800">
                                        {bannedInfo()?.reason || "Aucune raison spécifiée"}
                                    </p>
                                </div>
                            </div>

                            <div class="border-t border-red-300 pt-4 mt-4">
                                <div class="flex items-center gap-3 text-sm text-red-800 mb-2">
                                    <Calendar size={18} />
                                    <span>
                                        Suspendu le {new Date(bannedInfo()?.bannedAt!).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                
                                <Show
                                    when={bannedInfo()?.bannedUntil}
                                    fallback={
                                        <div class="flex items-center gap-3 text-sm font-bold text-red-900">
                                            <Clock size={18} />
                                            <span>Suspension permanente</span>
                                        </div>
                                    }
                                >
                                    <div class="flex items-center gap-3 text-sm text-red-800">
                                        <Clock size={18} />
                                        <span>
                                            Fin de la suspension : {new Date(bannedInfo()!.bannedUntil!).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <Show when={calculateRemainingDays() !== null && calculateRemainingDays()! > 0}>
                                        <div class="mt-3 text-center">
                                            <div class="inline-block bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-2xl">
                                                {calculateRemainingDays()} jour{calculateRemainingDays()! > 1 ? 's' : ''} restant{calculateRemainingDays()! > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </Show>
                                </Show>
                            </div>
                        </div>

                        <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                            <h3 class="font-bold text-gray-900 mb-3">Que faire maintenant ?</h3>
                            <ul class="space-y-2 text-gray-700 text-sm">
                                <li class="flex items-start gap-2">
                                    <span class="text-color-main mt-0.5">•</span>
                                    <span>Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe de support</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="text-color-main mt-0.5">•</span>
                                    <span>Consultez nos conditions d'utilisation pour comprendre nos règles</span>
                                </li>
                                <Show when={bannedInfo()?.bannedUntil}>
                                    <li class="flex items-start gap-2">
                                        <span class="text-color-main mt-0.5">•</span>
                                        <span>Votre compte sera automatiquement réactivé à la fin de la suspension</span>
                                    </li>
                                </Show>
                            </ul>
                        </div>

                        <button
                            onClick={handleLogout}
                            class="w-full py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
                        >
                            Se déconnecter
                        </button>
                    </div>
                </div>
            </Show>
        </div>
    );
};

export default BannedPage;