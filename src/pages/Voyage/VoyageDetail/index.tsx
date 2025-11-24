import { Show, createEffect, createSignal, onMount } from "solid-js";

import { TripHeader } from "./TripHeader";
import { TripDescription } from "./TripDescription";
import { TripTravelTypes } from "./TripTravelTypes";
import { TripPhotos } from "./TripPhotos";
import { TripParticipants } from "./TripParticipants";
import { TripSummary } from "./Sidebar/TripSummary";
import { ActionButtons } from "./Sidebar/ActionButtons";
import { OrganizerCard } from "./Sidebar/OrganizerCard";
import { UserQuestions } from "./UserQuestions";
import { TravelTypesModal } from "./Modals/TravelTypesModal";
import { AskQuestionModal } from "./Modals/AskQuestionModal";
import { DeleteTripModal } from "./Modals/DeleteTripModal";
import { useTripData } from "./hooks/useTripData";
import { useTripEdit } from "./hooks/useTripEdit";
import { useTripMedia } from "./hooks/useTripMedia";
import { useTripActions } from "./hooks/useTripActions";
import { getAllTrips, getTripById, trip } from "../../../stores/tripStore";
import { user } from "../../../stores/userStore";
import { backend } from "../../../stores/configStore";
import { TripImages } from "./TripImages";
import { useNavigate } from "@solidjs/router";

export const VoyageDetailPage = () => {
    
    const navigate = useNavigate();
    let editTripTravelTypesModal: HTMLDialogElement | undefined;
    
    const [activeTab, setActiveTab] = createSignal<'members' | 'pending'>('members');
    
    const {
        isLoading,
        organizer,
        tripMembers,
        pendingRequests,
        memberStatus,
        loadTripMembers,
        loadPendingRequests,
        checkMemberStatus
    } = useTripData();

    const {
        isEditing,
        hasChanges,
        setHasMediaChangesState,
        editTitle,
        setEditTitle,
        editSummary,
        setEditSummary,
        editStartDate,
        editEndDate,
        editMinDays,
        setEditMinDays,
        editMaxDays,
        setEditMaxDays,
        editBudgetEur,
        setEditBudgetEur,
        editMinAge,
        setEditMinAge,
        editMaxAge,
        setEditMaxAge,
        editTravelTypes,
        toggleTravelType,
        handleEdit,
        handleCancel,
        handleSave: saveEditChanges,
        startDateInput,
        endDateInput,
    } = useTripEdit(); 

    const {
        uploadError,
        isUploadingMedia,
        allEditMedia,
        handleFileSelectEdit,
        handleRemoveExistingMedia,
        handleRemoveTemporaryMedia,
        moveMediaLeft,
        moveMediaRight,
        saveMediaChanges,
        temporaryEditMedia,
        hasMediaChanges 
    } = useTripMedia(isEditing);

    createEffect(() => {
        setHasMediaChangesState(hasMediaChanges());
    });

    const {
        isRequesting,
        isDeletingTrip,
        questionText,
        setQuestionText,
        isSendingQuestion,
        questionStatus,
        userQuestions,
        isLoadingQuestions,
        loadUserQuestions,
        handleRequestToJoin,
        handleSendQuestion,
        confirmDeleteTrip,
        handleAcceptMember,
        handleDeclineMember
    } = useTripActions();

    onMount(async () => {
        if (trip.currentTrip && user.profile?.id) {
            const isUserTrip = user.profile.id !== (trip.currentTrip as any).organizerId;
            if (isUserTrip) {
                await loadUserQuestions(trip.currentTrip.id);
            }
        }
    });

    createEffect(() => {
        if (isLoading()) return;
        
        const org = organizer();

        if (!org || org.isDeleted) {
            navigate("/voyage", { replace: true });
        }
    });

    const handleJoinAndReload = async () => {
        await handleRequestToJoin();

        if (trip.currentTrip && user.profile?.id) {

            await checkMemberStatus(trip.currentTrip.id, user.profile.id);
            if (isUserTrip()) {
                await loadPendingRequests(
                    trip.currentTrip.id,
                    (trip.currentTrip as any).organizerId
                );
            }
        }
    };

    const isUserTrip = () => {
        return user.profile?.id === (trip.currentTrip as any)?.organizerId;
    };

    const allTravelTypes = () => {
        if (!backend.travelTypes) return [];
        if (Array.isArray(backend.travelTypes)) return backend.travelTypes;
        return [];
    };

    const handleSave = async () => {
        const mediaSuccess = await saveMediaChanges();
        if (!mediaSuccess) return;

        const temporaryIds = temporaryEditMedia().map(m => String(m.id));
        const saveSuccess = await saveEditChanges(temporaryIds);
    
        if (saveSuccess && trip.currentTrip?.id) {

            await getTripById(trip.currentTrip.id);
            
            await getAllTrips(1, false);
        }
    };

    const handleDeleteTrip = () => {
        const modal = document.getElementById('confirm_delete_trip_modal') as HTMLDialogElement;
        modal?.showModal();
    };

    const openQuestionModal = () => {
        (document.getElementById('ask_question_modal') as any)?.showModal();
    };

    return (
        <Show
            when={!isLoading()}
            fallback={
                <div class="flex-1 flex items-center justify-center min-h-screen bg-color-light">
                    <span class="loading loading-spinner loading-lg text-color-main"></span>
                </div>
            }
        >
            <Show when={trip.currentTrip}>
                <div class="pt-16 pb-16 bg-color-light min-h-screen container-app">
                    <div class="container-app-wide py-8">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-2 space-y-6">
                                <TripImages />

                                <TripHeader
                                    trip={trip.currentTrip}
                                    isUserTrip={isUserTrip()}
                                    isEditing={isEditing()}
                                    editTitle={editTitle}
                                    setEditTitle={setEditTitle}
                                    editStartDate={editStartDate}
                                    editEndDate={editEndDate}
                                    editMinDays={editMinDays}
                                    setEditMinDays={setEditMinDays}
                                    editMaxDays={editMaxDays}
                                    setEditMaxDays={setEditMaxDays}
                                    startDateInput={startDateInput}
                                    endDateInput={endDateInput}
                                />

                                <TripDescription
                                    summary={trip.currentTrip?.summary}
                                    isEditing={isEditing()}
                                    editSummary={editSummary}
                                    setEditSummary={setEditSummary}
                                />

                                <TripTravelTypes
                                    travelTypes={(trip.currentTrip as any).travelTypes || []}
                                    isEditing={isEditing()}
                                    editTravelTypes={editTravelTypes}
                                    allTravelTypes={allTravelTypes()}
                                    onOpenModal={() => editTripTravelTypesModal?.showModal()}
                                />

                                <TripPhotos
                                    media={(trip.currentTrip as any).media || []}
                                    isEditing={isEditing()}
                                    allEditMedia={allEditMedia}
                                    isUploadingMedia={isUploadingMedia}
                                    uploadError={uploadError}
                                    onFileSelect={handleFileSelectEdit}
                                    onMoveLeft={moveMediaLeft}
                                    onMoveRight={moveMediaRight}
                                    onRemove={(mediaId, isTemporary) => 
                                        isTemporary ? handleRemoveTemporaryMedia(mediaId) : handleRemoveExistingMedia(mediaId)
                                    }
                                />

                                <TripParticipants
                                    members={tripMembers()}
                                    pendingRequests={pendingRequests()}
                                    isUserTrip={isUserTrip()}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    onAcceptMember={(userId) => handleAcceptMember(
                                        userId, 
                                        trip.currentTrip!.id, 
                                        user.profile!.id, 
                                        loadTripMembers, 
                                        loadPendingRequests
                                    )}
                                    onDeclineMember={(userId) => handleDeclineMember(
                                        userId, 
                                        trip.currentTrip!.id, 
                                        user.profile!.id, 
                                        loadPendingRequests
                                    )}
                                />
                            </div>

                            <div class="lg:col-span-1 space-y-6">
                                <TripSummary
                                    trip={trip.currentTrip}
                                    isEditing={isEditing()}
                                    editBudgetEur={editBudgetEur}
                                    setEditBudgetEur={setEditBudgetEur}
                                    editMinAge={editMinAge}
                                    setEditMinAge={setEditMinAge}
                                    editMaxAge={editMaxAge}
                                    setEditMaxAge={setEditMaxAge}
                                />

                                <ActionButtons
                                    isUserTrip={isUserTrip()}
                                    isEditing={isEditing()}
                                    hasChanges={hasChanges}
                                    memberStatus={memberStatus}
                                    isRequesting={isRequesting}
                                    onRequestToJoin={handleJoinAndReload}
                                    onAskQuestion={openQuestionModal}
                                    onEdit={handleEdit}
                                    onCancel={handleCancel}
                                    onSave={handleSave}
                                    onDelete={handleDeleteTrip}
                                />

                                <Show when={!isUserTrip() && userQuestions().length > 0}>
                                    <UserQuestions
                                        questions={userQuestions}
                                        isLoading={isLoadingQuestions}
                                    />
                                </Show>

                                <OrganizerCard organizer={organizer()} />
                            </div>
                        </div>
                    </div>
                </div>

                <TravelTypesModal
                    editTravelTypes={editTravelTypes()}
                    allTravelTypes={allTravelTypes()}
                    onToggle={toggleTravelType}
                    ref={(el) => { editTripTravelTypesModal = el; }}
                />

                <AskQuestionModal
                    questionText={questionText}
                    setQuestionText={setQuestionText}
                    isSending={isSendingQuestion}
                    status={questionStatus}
                    onSend={handleSendQuestion}
                />

                <DeleteTripModal
                    isDeleting={isDeletingTrip}
                    onConfirm={confirmDeleteTrip}
                />
            </Show>
        </Show>
    );
};

export default VoyageDetailPage;