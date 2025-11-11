import { For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Users2 } from "lucide-solid";
import type { TripMember } from "../types";

interface SimpleMembersListProps {
    members: TripMember[];
}

export const SimpleMembersList = (props: SimpleMembersListProps) => {
    const navigate = useNavigate();

    return (
        <Show 
            when={props.members.length > 0}
            fallback={
                <div class="text-center py-8">
                    <Users2 size={48} class="text-gray-300 mx-auto mb-2" />
                    <p class="text-gray-500">Soyez le premier à rejoindre !</p>
                </div>
            }
        >
            <div class="space-y-2">
                <For each={props.members}>
                    {(member) => (
                        <div 
                            onClick={() => {
                                if (member.user?.username !== 'Utilisateur supprimé') {
                                    navigate(`/user/${member.user?.id}`);
                                }
                            }}
                            class={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                                member.user?.username === 'Utilisateur supprimé'
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:bg-gray-50'
                            }`}
                        >
                            <div class="w-12 h-12 rounded-full bg-color-main flex items-center justify-center overflow-hidden flex-shrink-0">
                                <Show 
                                    when={member.user?.profilePictureUrl}
                                    fallback={
                                        <span class="text-white font-bold text-lg">
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
                            <p class={`text-base ${
                                member.user?.username === 'Utilisateur supprimé'
                                    ? 'text-gray-500 italic'
                                    : 'text-color-dark'
                            }`}>
                                {member.user?.username}
                            </p>
                        </div>
                    )}
                </For>
            </div>
        </Show>
    );
};