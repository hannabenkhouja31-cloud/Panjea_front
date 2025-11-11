import { For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Clock, Check, X } from "lucide-solid";
import type { PendingRequest } from "../types";

interface PendingRequestsListProps {
    requests: PendingRequest[];
    onAccept: (userId: string) => void;
    onDecline: (userId: string) => void;
}

export const PendingRequestsList = (props: PendingRequestsListProps) => {
    const navigate = useNavigate();

    return (
        <Show 
            when={props.requests.length > 0}
            fallback={
                <div class="text-center py-8">
                    <Clock size={48} class="text-gray-300 mx-auto mb-2" />
                    <p class="text-gray-500">Aucune demande en attente</p>
                </div>
            }
        >
            <div class="space-y-3 max-h-64 overflow-y-auto">
                <For each={props.requests}>
                    {(request) => (
                        <div class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
                            <div 
                                onClick={() => {
                                    if (request.user?.username !== 'Utilisateur supprimé') {
                                        navigate(`/user/${request.user?.id}`);
                                    }
                                }}
                                class={`flex items-center gap-3 flex-1 rounded-lg p-2 -m-2 transition-all ${
                                    request.user?.username === 'Utilisateur supprimé'
                                        ? 'cursor-default'
                                        : 'cursor-pointer hover:bg-gray-50'
                                }`}
                            >
                                <div class="w-14 h-14 rounded-full bg-color-main flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <Show 
                                        when={request.user?.profilePictureUrl}
                                        fallback={
                                            <span class="text-white font-bold text-2xl">
                                                {request.user?.username[0]?.toUpperCase()}
                                            </span>
                                        }
                                    >
                                        <img 
                                            src={request.user?.profilePictureUrl} 
                                            alt={request.user?.username}
                                            class="w-full h-full object-cover"
                                        />
                                    </Show>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class={`font-semibold text-lg truncate ${
                                        request.user?.username === 'Utilisateur supprimé'
                                            ? 'text-gray-500 italic'
                                            : 'text-color-dark'
                                    }`}>
                                        {request.user?.username}
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        {new Date(request.joinedAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                            <div class="flex gap-2 flex-shrink-0">
                                <button
                                    onClick={() => props.onAccept(request.user.id)}
                                    class="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                    style="background-color: #45AF95;"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => props.onDecline(request.user.id)}
                                    class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </Show>
    );
};