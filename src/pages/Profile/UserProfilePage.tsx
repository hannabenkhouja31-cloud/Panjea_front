import { createSignal, Show, createResource } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { backend } from "../../stores/configStore";
import { getUserProfileById, type UserProfile } from "../../stores/userStore";
import { getTripsByOrganizer } from "../../stores/tripStore";
import type { Trip } from "../../models";
import { ProfilePersonalInfo } from "./ProfilePersonalInfo";
import { ProfileTravelTypes } from "./ProfileTravelTypes";
import { ProfileBudget } from "./ProfileBudget";
import { ProfileLanguages } from "./ProfileLanguages";
import { ProfileTrips } from "./ProfileTrips";

export const UserProfilePage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = createSignal("about");

    const [userProfile] = createResource(
        () => params.id,
        async (userId) => {
            const result = await getUserProfileById(userId);
            if (!result.success) {
                return null;
            }
            return result.data as UserProfile;
        }
    );

    const [userTrips] = createResource(
        () => params.id,
        async (userId) => {
            const result = await getTripsByOrganizer(userId);
            if (!result.success) {
                return [];
            }
            return result.data as Trip[];
        }
    );

    const travelTypes = () => {
        if (!backend.travelTypes || !userProfile()?.travelTypes) return [];
        return backend.travelTypes.filter(tt => 
            userProfile()?.travelTypes.includes(tt.slug as any)
        );
    };

    const getLocation = () => {
        const profile = userProfile();
        const parts = [];
        if (profile?.city) parts.push(profile.city);
        if (profile?.country) parts.push(profile.country);
        return parts.length > 0 ? parts.join(", ") : "Non renseigné";
    };

    return (
        <div class="flex-1 bg-color-light">
            <Show 
                when={!userProfile.loading && !userTrips.loading}
                fallback={
                    <div class="flex-1 flex items-center justify-center min-h-screen">
                        <span class="loading loading-spinner loading-lg text-color-main"></span>
                    </div>
                }
            >
                <Show 
                    when={userProfile()}
                    fallback={
                        <div class="container-app py-12">
                            <div class="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <svg class="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <h2 class="text-2xl font-bold text-gray-700 mb-2">Utilisateur introuvable</h2>
                                <p class="text-gray-500 mb-6">Cet utilisateur n'existe pas ou a été supprimé</p>
                                <button 
                                    onClick={() => navigate("/voyage")}
                                    class="bg-color-main text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200"
                                >
                                    Retour aux voyages
                                </button>
                            </div>
                        </div>
                    }
                >
                    <div class="container-app py-12">
                        <div class="bg-white rounded-2xl shadow-sm p-8 mb-6">
                            <div class="flex items-center gap-6">
                                <div class="avatar avatar-placeholder">
                                    <Show 
                                        when={userProfile()?.profilePictureUrl}
                                        fallback={
                                            <div class="bg-neutral text-neutral-content w-24 rounded-full">
                                                <span class="text-4xl">
                                                    {userProfile()?.username?.[0]?.toUpperCase() || "P"}
                                                </span>
                                            </div>
                                        }
                                    >
                                        <div class="w-24 rounded-full">
                                            <img src={userProfile()?.profilePictureUrl} alt={userProfile()?.username} />
                                        </div>
                                    </Show>
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center gap-3 mb-2">
                                        <h1 class="text-3xl font-bold text-color-dark">{userProfile()?.username}</h1>
                                        <Show when={userProfile()?.isVerified}>
                                            <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                            </svg>
                                        </Show>
                                    </div>
                                    <p class="text-gray-600 mb-2">{getLocation()}</p>
                                    <Show when={userProfile()?.description}>
                                        <p class="text-gray-700">{userProfile()?.description}</p>
                                    </Show>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl shadow-sm">
                            <div class="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab("about")}
                                    class={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                                        activeTab() === "about"
                                            ? "text-color-main border-b-3"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    À propos
                                </button>
                                <button
                                    onClick={() => setActiveTab("trips")}
                                    class={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                                        activeTab() === "trips"
                                            ? "text-color-main border-b-3"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Voyages ({userTrips()?.length || 0})
                                </button>
                            </div>

                            <div class="p-8">
                                <Show when={activeTab() === "about"}>
                                    <div class="space-y-12">
                                        <ProfilePersonalInfo 
                                            profile={userProfile()!}
                                            isEditing={false}
                                            editDescription=""
                                            editCity=""
                                            editCountry=""
                                            onDescriptionChange={() => {}}
                                            onCityChange={() => {}}
                                            onCountryChange={() => {}}
                                        />

                                        <ProfileTravelTypes 
                                            profile={userProfile()!}
                                            isEditing={false}
                                            editTravelTypes={[]}
                                            allTravelTypes={backend.travelTypes || []}
                                            travelTypes={travelTypes()}
                                            onToggleTravelType={() => {}}
                                        />

                                        <ProfileBudget 
                                            profile={userProfile()!}
                                            isEditing={false}
                                            editBudgetLevel={1}
                                            onBudgetChange={() => {}}
                                        />

                                        <ProfileLanguages 
                                            languages={userProfile()?.languages || []}
                                            isEditing={false}
                                            editLanguages={[]}
                                            selectedLanguageIndex={0}
                                            onSelectLanguageIndex={() => {}}
                                            onAddLanguage={() => {}}
                                            onRemoveLanguage={() => {}}
                                            onUpdateLanguage={() => {}}
                                            getAvailableLanguages={() => []}
                                        />
                                    </div>
                                </Show>

                                <Show when={activeTab() === "trips"}>
                                    <ProfileTrips trips={userTrips() || []} />
                                </Show>
                            </div>
                        </div>
                    </div>
                </Show>
            </Show>
        </div>
    );
};

export default UserProfilePage;