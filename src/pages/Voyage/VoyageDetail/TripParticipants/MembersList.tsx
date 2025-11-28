import { For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Users2 } from "lucide-solid";
import type { TripMember } from "../types";

interface MembersListProps {
    members: TripMember[];
}

export const MembersList = (props: MembersListProps) => {
    const navigate = useNavigate();

    return (
        <Show
            when={props.members.length > 0}
            fallback={
                <div class="text-center py-6 sm:py-8">
                    <Users2 class="text-gray-300 mx-auto mb-2 w-10 h-10 sm:w-12 sm:h-12" />
                    <p class="text-gray-500 text-sm sm:text-base">Aucun membre pour le moment</p>
                </div>
            }
        >
            <div class="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                <For each={props.members}>
                    {(member) => (
                        <div
                            onClick={() => {
                                if (member.user?.username !== 'Utilisateur supprimé') {
                                    navigate(`/user/${member.user?.id}`);
                                }
                            }}
                            class={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border border-gray-200 bg-white transition-all ${
                                member.user?.username === 'Utilisateur supprimé'
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:bg-gray-50 hover:border-color-main'
                            }`}
                        >
                            <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-color-main flex items-center justify-center overflow-hidden flex-shrink-0">
                                <Show
                                    when={member.user?.profilePictureUrl}
                                    fallback={
                                        <span class="text-white font-bold text-lg sm:text-2xl">
                                            {member.user?.username[0]?.toUpperCase()}
                                        </span>
                                    }
                                >
                                    <img
                                        src={member.user?.profilePictureUrl}
                                        alt={member.user?.username}
                                        class="w-full h-full object-cover"
                                    />
                                </Show>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class={`font-semibold text-sm sm:text-lg truncate ${
                                    member.user?.username === 'Utilisateur supprimé'
                                        ? 'text-gray-500 italic'
                                        : 'text-color-dark'
                                }`}>
                                    {member.user?.username}
                                </p>
                                <p class="text-xs sm:text-sm text-gray-500">
                                    Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </Show>
    );
};