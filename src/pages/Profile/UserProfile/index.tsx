import { createSignal, Show, createResource, createEffect } from "solid-js";
import { useParams } from "@solidjs/router";
import { ProfilePersonalInfo } from "../ProfilePersonalInfo";
import { ProfileTravelTypes } from "../ProfileTravelTypes";
import { ProfileBudget } from "../ProfileBudget";
import { ProfileLanguages } from "../ProfileLanguages";
import { ProfileTrips } from "../ProfileTrips";
import { UserProfileHeader } from "./UserProfileHeader";
import { ReportModal } from "./ReportModal";
import { UserNotFound, UserDeleted } from "./EmptyStates";
import { getUserProfileById, user, type UserProfile } from "../../../stores/userStore";
import { getTripsByOrganizer } from "../../../stores/tripStore";
import type { Trip } from "../../../models";
import { backend } from "../../../stores/configStore";

export const UserProfilePage = () => {

    const params = useParams();
    const [activeTab, setActiveTab] = createSignal("about");
    const [isReportModalOpen, setIsReportModalOpen] = createSignal(false);
    const [reportReason, setReportReason] = createSignal("");
    const [reportDescription, setReportDescription] = createSignal("");
    const [isSendingReport, setIsSendingReport] = createSignal(false);
    const [hasReported, setHasReported] = createSignal(false);
    const [reportStatus, setReportStatus] = createSignal<'PENDING' | 'RESOLVED' | 'DISMISSED' | null>(null);

    const checkIfReported = async () => {
        if (!user.profile?.id || !params.id) return;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user-reports/check?reportedUserId=${params.id}&reporterUserId=${user.profile.id}`);
            if (response.ok) {
                const data = await response.json();
                setHasReported(data.hasReported);
                setReportStatus(data.reportStatus);
            }
        } catch (error) {
            console.error("Erreur vérification signalement:", error);
        }
    };

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

    const openReportModal = () => {
        setReportReason("");
        setReportDescription("");
        setIsReportModalOpen(true);
    };

    const handleReport = async () => {
        if (!reportReason() || !reportDescription().trim() || !user.profile?.id) return;

        setIsSendingReport(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user-reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportedUserId: params.id,
                    reporterUserId: user.profile.id,
                    reason: reportReason(),
                    description: reportDescription().trim(),
                }),
            });

            if (response.ok) {
                setIsReportModalOpen(false);
                await checkIfReported();
                alert("Signalement envoyé. Notre équipe va l'examiner.");
            } else {
                const error = await response.json();
                alert(error.message || "Erreur lors du signalement");
            }
        } catch (error) {
            console.error("Erreur signalement:", error);
            alert("Impossible d'envoyer le signalement");
        } finally {
            setIsSendingReport(false);
        }
    };

    createEffect(() => {
        if (userProfile() && user.profile?.id && params.id !== user.profile.id) {
            checkIfReported();
        }
    });
    
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
                    fallback={<UserNotFound />}
                >
                    <Show when={!userProfile()?.isDeleted} fallback={<UserDeleted />}>
                        <div class="container-app py-12">
                            <UserProfileHeader
                                profile={userProfile()}
                                userId={params.id}
                                currentUserId={user.profile?.id}
                                hasReported={hasReported()}
                                reportStatus={reportStatus()}
                                onOpenReport={openReportModal}
                            />

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
            </Show>
            
            <ReportModal
                isOpen={isReportModalOpen()}
                onClose={() => setIsReportModalOpen(false)}
                reportReason={reportReason()}
                reportDescription={reportDescription()}
                isSending={isSendingReport()}
                onReasonChange={setReportReason}
                onDescriptionChange={setReportDescription}
                onSubmit={handleReport}
            />
        </div>
    );
};

export default UserProfilePage;