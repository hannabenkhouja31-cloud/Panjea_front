import { createEffect, createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { user } from "../../stores/userStore";
import { AdminStats } from "./AdminStats";
import { AdminModeration } from "./AdminModeration";

export const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = createSignal<'stats' | 'moderation'>('stats');

    createEffect(() => {
            if (!user.isConnected) {
                navigate("/inscription", { replace: true });
            }
    });

    onMount(() => {
        if (!user.profile?.id) {
            navigate("/connexion", { replace: true });
            return;
        }

        if (!user.profile?.isAdmin) {
            navigate("/voyage", { replace: true });
            return;
        }
    });

    return (
        <div class="flex-1 bg-color-light min-h-screen pt-16">
            <div class="container-app py-8">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-color-dark mb-2">Administration</h1>
                    <p class="text-gray-600">Gestion de la plateforme Panjéa</p>
                </div>

                <div class="bg-white rounded-2xl shadow-sm">
                    <div class="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('stats')}
                            class={`flex-1 py-4 px-6 text-center font-semibold ${
                                activeTab() === 'stats'
                                    ? 'text-color-main border-b-3'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Statistiques
                        </button>
                        <button
                            onClick={() => setActiveTab('moderation')}
                            class={`flex-1 py-4 px-6 text-center font-semibold ${
                                activeTab() === 'moderation'
                                    ? 'text-color-main border-b-3'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Modération
                        </button>
                    </div>

                    <div class="p-6">
                        <Show when={activeTab() === 'stats'}>
                            <AdminStats />
                        </Show>
                        <Show when={activeTab() === 'moderation'}>
                            <AdminModeration />
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;