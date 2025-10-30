import { Show } from "solid-js";
import { MapPin } from "lucide-solid";
import type { UserProfile } from "../../stores/userStore";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileHeaderProps {
    profile: UserProfile | null;
    activeTab: string;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
}

export const ProfileHeader = (props: ProfileHeaderProps) => {
    const getLocation = () => {
        const parts = [];
        if (props.profile?.city) parts.push(props.profile.city);
        if (props.profile?.country) parts.push(props.profile.country);
        return parts.length > 0 ? parts.join(", ") : "Non renseigné";
    };

    return (
        <div class="bg-white rounded-2xl  p-8 mb-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-6">
                    <ProfileAvatar profile={props.profile} isEditing={props.isEditing} />
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h1 class="text-3xl font-bold text-color-dark">{props.profile?.username}</h1>
                            <Show when={props.profile?.isVerified}>
                                <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                            </Show>
                        </div>
                        <div class="flex items-center gap-2 text-gray-600 mb-3">
                            <MapPin size={18} color="#DC9E53"/>
                            <span>{getLocation()}</span>
                        </div>
                        <Show when={props.profile?.description}>
                            <p class="text-gray-700">{props.profile?.description}</p>
                        </Show>
                    </div>
                </div>
                <Show when={props.activeTab === "about"}>
                    <Show when={!props.isEditing}
                        fallback={
                            <button 
                                onClick={props.onCancel}
                                class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                            >
                                Annuler
                            </button>
                        }>
                        <button 
                            onClick={props.onEdit}
                            class="bg-color-main text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200"
                        >
                            Modifier le profil
                        </button>
                    </Show>
                </Show>
            </div>
        </div>
    );
};