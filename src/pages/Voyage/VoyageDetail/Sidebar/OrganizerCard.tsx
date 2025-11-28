import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { User, UserCheck } from "lucide-solid";
import type { Organizer } from "../types";

interface OrganizerCardProps {
    organizer: Organizer | null;
}

export const OrganizerCard = (props: OrganizerCardProps) => {
    const navigate = useNavigate();

    return (
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6">
            <h3 class="font-bold text-color-dark mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <User size={18} class="sm:w-5 sm:h-5 text-color-main" />
                Organisé par
            </h3>
            <Show
                when={props.organizer}
                fallback={
                    <div class="flex items-center justify-center py-4">
                        <span class="loading loading-spinner loading-md text-color-main"></span>
                    </div>
                }
            >
                <div
                    onClick={() => {
                        if (props.organizer?.username !== 'Utilisateur supprimé') {
                            navigate(`/user/${props.organizer?.id}`);
                        }
                    }}
                    class={`flex items-center gap-3 sm:gap-4 rounded-xl p-2 sm:p-3 -m-2 sm:-m-3 transition-all ${
                        props.organizer?.username === 'Utilisateur supprimé'
                            ? 'cursor-default'
                            : 'cursor-pointer hover:bg-gray-50'
                    }`}
                >
                    <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-color-main border-2 border-black/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Show
                            when={props.organizer?.profilePictureUrl}
                            fallback={
                                <span class="text-white font-bold text-xl sm:text-2xl">
                                    {props.organizer?.username[0]?.toUpperCase()}
                                </span>
                            }
                        >
                            <img
                                src={props.organizer?.profilePictureUrl}
                                alt={props.organizer?.username}
                                class="w-full h-full object-cover"
                            />
                        </Show>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h4 class={`font-bold text-base sm:text-lg truncate ${
                                props.organizer?.username === 'Utilisateur supprimé'
                                    ? 'text-gray-500 italic'
                                    : 'text-color-dark'
                            }`}>
                                {props.organizer?.username}
                            </h4>
                            <Show when={props.organizer?.isVerified && props.organizer?.username !== 'Utilisateur supprimé'}>
                                <UserCheck size={14} class="sm:w-4 sm:h-4 text-color-secondary" />
                            </Show>
                        </div>
                        <Show when={(props.organizer?.city || props.organizer?.country) && props.organizer?.username !== 'Utilisateur supprimé'}>
                            <p class="text-xs sm:text-sm text-gray-600 truncate">
                                {[props.organizer?.city, props.organizer?.country].filter(Boolean).join(', ')}
                            </p>
                        </Show>

                        <Show when={props.organizer?.description && props.organizer?.username !== 'Utilisateur supprimé'}>
                            <p class="text-xs sm:text-sm text-gray-700 mt-1 sm:mt-2 line-clamp-2">
                                {props.organizer?.description}
                            </p>
                        </Show>
                    </div>
                </div>
            </Show>
        </div>
    );
};