import { A, useNavigate, useParams } from "@solidjs/router";
import { createSignal, onMount, Show, For, createEffect } from "solid-js";
import { User, UserCheck, Users2, MapPin, Calendar, Clock, Users, Share2, MessageCircle, FileText, Compass, Image, Edit, X, Check, Camera, MessageSquare } from "lucide-solid";
import { user } from "../../stores/userStore";
import { createTemporaryTripMedia, deleteTemporaryTripMedia, deleteTripMedia, getTripById, trip, updateTrip, updateTripMediaPositions } from "../../stores/tripStore";
import { backend } from "../../stores/configStore";
import AirDatepicker from "air-datepicker";
import "air-datepicker/air-datepicker.css";
import localeFr from "air-datepicker/locale/fr";
import { createUploadThing } from "../../utils/uploadthing";
import { TripImages } from "./voyageDetailsPage/TripImages";
import { getMessagesByTripId, messagesStore } from "../../stores/messagesStore";
import type { Message } from "../../models";

export const VoyageDetailPage = () => {

    let editTripTravelTypesModal: HTMLDialogElement | undefined;
    
    const navigate = useNavigate();
    const params = useParams();
    const [isLoading, setIsLoading] = createSignal(true);
    const [isEditing, setIsEditing] = createSignal(false);
    const [hasChanges, setHasChanges] = createSignal(false);

    const [editTitle, setEditTitle] = createSignal("");
    const [editSummary, setEditSummary] = createSignal("");
    const [editStartDate, setEditStartDate] = createSignal("");
    const [editEndDate, setEditEndDate] = createSignal("");
    const [editMinDays, setEditMinDays] = createSignal(1);
    const [editMaxDays, setEditMaxDays] = createSignal(7);
    const [editBudgetEur, setEditBudgetEur] = createSignal<number | undefined>(undefined);
    const [editMinAge, setEditMinAge] = createSignal<number | undefined>(undefined);
    const [editMaxAge, setEditMaxAge] = createSignal<number | undefined>(undefined);
    const [editTravelTypes, setEditTravelTypes] = createSignal<string[]>([]);
    const [editMedia, setEditMedia] = createSignal<any[]>([]);
    const [temporaryEditMedia, setTemporaryEditMedia] = createSignal<any[]>([]);
    const [uploadError, setUploadError] = createSignal<string | null>(null);
    const [isUploadingMedia, setIsUploadingMedia] = createSignal(false);
    const [deletedMediaIds, setDeletedMediaIds] = createSignal<string[]>([]);
    const [organizer, setOrganizer] = createSignal<any>(null);
    const [tripMembers, setTripMembers] = createSignal<any[]>([]);
    const [pendingRequests, setPendingRequests] = createSignal<any[]>([]);
    const [memberStatus, setMemberStatus] = createSignal<string | null>(null);
    const [activeTab, setActiveTab] = createSignal<'members' | 'pending'>('members');
    const [isRequesting, setIsRequesting] = createSignal(false);

    const [userQuestions, setUserQuestions] = createSignal<Message[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = createSignal(false);

    const [questionText, setQuestionText] = createSignal("");
    const [isSendingQuestion, setIsSendingQuestion] = createSignal(false);
    const [questionStatus, setQuestionStatus] = createSignal<{ message: string, type: 'success' | 'error' | '' }>({ message: '', type: '' });

    let startDateInput: HTMLInputElement | undefined;
    let endDateInput: HTMLInputElement | undefined;
    let startDatePicker: AirDatepicker<HTMLInputElement> | undefined;
    let endDatePicker: AirDatepicker<HTMLInputElement> | undefined;

    onMount(async () => {
        if (!user.isConnected) {
            navigate("/connexion", { replace: true });
            return;
        }

        const result = await getTripById(params.id);
        setIsLoading(false);

        if (!result.success) {
            navigate("/voyage");
            return;
        }

        if (trip.currentTrip) {
            await loadOrganizerInfo((trip.currentTrip as any).organizerId);
            await loadTripMembers(trip.currentTrip.id);
            
            if (user.profile?.id) {
                await checkMemberStatus(trip.currentTrip.id, user.profile.id);
                
                if (isUserTrip()) {
                    await loadPendingRequests(trip.currentTrip.id, user.profile.id);
                }
                await loadUserQuestions(trip.currentTrip.id);
            }
        }
    });

    const loadOrganizerInfo = async (organizerId: string) => {
        try {
            const response = await fetch(`${backendUrl}/users/${organizerId}`);
            if (response.status === 200) {
                const userData = await response.json();
                setOrganizer(userData);
            }
        } catch (error) {
            console.error("Erreur chargement organisateur:", error);
        }
    };

    const loadTripMembers = async (tripId: string) => {
        try {
            const response = await fetch(`${backendUrl}/trip-members/${tripId}`);
            if (response.status === 200) {
                const members = await response.json();
                setTripMembers(members.filter((m: any) => m.status === 'JOINED'));
            }
        } catch (error) {
            console.error("Erreur chargement membres:", error);
        }
    };

    const loadPendingRequests = async (tripId: string, organizerId: string) => {
        try {
            const response = await fetch(`${backendUrl}/trip-members/${tripId}/pending?organizerId=${organizerId}`);
            if (response.status === 200) {
                const pending = await response.json();
                setPendingRequests(pending);
            }
        } catch (error) {
            console.error("Erreur chargement demandes:", error);
        }
    };

    const checkMemberStatus = async (tripId: string, userId: string) => {
        try {
            const response = await fetch(`${backendUrl}/trip-members/${tripId}/status/${userId}`);
            if (response.status === 200) {
                const data = await response.json();
                setMemberStatus(data.status);
            }
        } catch (error) {
            console.error("Erreur vérification statut:", error);
        }
    };

    const loadUserQuestions = async (tripId: string) => {
        if (!user.profile?.id) return;
        
        setIsLoadingQuestions(true);
        try {
            await getMessagesByTripId(tripId, user.profile.id, 1, false);
            
            const messages = messagesStore.messagesByTrip[tripId] || [];
            const questions = messages.filter(msg => 
                msg.questionData && 
                msg.questionData.askerId === user.profile?.id
            );
            
            setUserQuestions(questions);
        } catch (error) {
            console.error("Erreur chargement questions:", error);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleRequestToJoin = async () => {
        if (!user.profile?.id || !trip.currentTrip?.id) return;
        
        setIsRequesting(true);
        try {
            const response = await fetch(`${backendUrl}/trips/${trip.currentTrip.id}/join-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.profile.id
                })
            });
            
            if (response.status === 201) {
                setMemberStatus('PENDING');
            }
        } catch (error) {
            console.error("Erreur demande:", error);
        } finally {
            setIsRequesting(false);
        }
    };

    const handleAcceptMember = async (userId: string, messageId?: string) => {
        if (!trip.currentTrip?.id || !user.profile?.id) return;
        
        try {
            const response = await fetch(`${backendUrl}/trip-members/${trip.currentTrip.id}/accept/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    organizerId: user.profile.id,
                    messageId: messageId 
                })
            });
            
            if (response.status === 200) {
                await loadTripMembers(trip.currentTrip.id);
                await loadPendingRequests(trip.currentTrip.id, user.profile.id);
            }
        } catch (error) {
            console.error("Erreur acceptation:", error);
        }
    };

    const handleDeclineMember = async (userId: string, messageId?: string) => {
        if (!trip.currentTrip?.id || !user.profile?.id) return;
        
        try {
            const response = await fetch(`${backendUrl}/trip-members/${trip.currentTrip.id}/decline/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    organizerId: user.profile.id,
                    messageId: messageId 
                })
            });
            
            if (response.status === 200) {
                await loadPendingRequests(trip.currentTrip.id, user.profile.id);
            }
        } catch (error) {
            console.error("Erreur refus:", error);
        }
    };

    const openQuestionModal = () => {
        setQuestionText("");
        setIsSendingQuestion(false);
        setQuestionStatus({ message: '', type: '' });
        (document.getElementById('ask_question_modal') as any)?.showModal();
    };

    const handleSendQuestion = async () => {
        if (!user.profile?.id || !trip.currentTrip?.id || !questionText().trim()) return; //

        setIsSendingQuestion(true);
        setQuestionStatus({ message: '', type: '' });

        const body = {
            question: questionText().trim(),
            askerId: user.profile.id
        };

        try {
            const response = await fetch(`${backendUrl}/trips/${trip.currentTrip.id}/ask-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                setQuestionStatus({ message: "Votre question a été envoyée à l'organisateur !", type: 'success' });
                setQuestionText("");
                setTimeout(() => {
                    (document.getElementById('ask_question_modal') as any)?.close();
                }, 1000);
                await loadUserQuestions(trip.currentTrip.id);
            } else {
                const errorData = await response.json();
                setQuestionStatus({ message: errorData.message || "Une erreur est survenue.", type: 'error' });
            }
            
        } catch (error) {
            console.error("Erreur lors de l'envoi de la question:", error);
            setQuestionStatus({ message: "Impossible de contacter le serveur.", type: 'error' });
        } finally {
            setIsSendingQuestion(false);
        }
    };

    createEffect(() => {
        if (isEditing() && trip.currentTrip) {
            setEditTitle(trip.currentTrip.title || "");
            setEditSummary(trip.currentTrip.summary || "");
            setEditStartDate((trip.currentTrip as any).startDate || "");
            setEditEndDate((trip.currentTrip as any).endDate || "");
            setEditMinDays(trip.currentTrip.minDays || 1);
            setEditMaxDays(trip.currentTrip.maxDays || 7);
            setEditBudgetEur(trip.currentTrip.budgetEur);
            setEditMinAge(trip.currentTrip.minAge);
            setEditMaxAge(trip.currentTrip.maxAge);
            setEditTravelTypes([...((trip.currentTrip as any).travelTypes || [])]);
            setEditMedia([...((trip.currentTrip as any).media || [])]);
            setTemporaryEditMedia([]);

            if (startDateInput && !startDatePicker) {
                startDatePicker = new AirDatepicker(startDateInput, {
                    locale: localeFr,
                    dateFormat: 'yyyy-MM-dd',
                    minDate: new Date(),
                    selectedDates: editStartDate() ? [new Date(editStartDate())] : [],
                    onSelect: ({ formattedDate }) => {
                        if (formattedDate) {
                            const newDate = Array.isArray(formattedDate) ? formattedDate[0] : formattedDate;
                            setEditStartDate(newDate);
                        }
                    }
                });
            }

            if (endDateInput && !endDatePicker) {
                endDatePicker = new AirDatepicker(endDateInput, {
                    locale: localeFr,
                    dateFormat: 'yyyy-MM-dd',
                    minDate: editStartDate() ? new Date(new Date(editStartDate()).getTime() + 86400000) : new Date(),
                    selectedDates: editEndDate() ? [new Date(editEndDate())] : [],
                    onSelect: ({ formattedDate }) => {
                        if (formattedDate) {
                            const newDate = Array.isArray(formattedDate) ? formattedDate[0] : formattedDate;
                            setEditEndDate(newDate);
                        }
                    }
                });
            }
        }
    });

    createEffect(() => {
        if (isEditing() && trip.currentTrip) {
            const titleChanged = editTitle() !== (trip.currentTrip.title || "");
            const summaryChanged = editSummary() !== (trip.currentTrip.summary || "");
            const startDateChanged = editStartDate() !== ((trip.currentTrip as any).startDate || "");
            const endDateChanged = editEndDate() !== ((trip.currentTrip as any).endDate || "");
            const minDaysChanged = editMinDays() !== (trip.currentTrip.minDays || 1);
            const maxDaysChanged = editMaxDays() !== (trip.currentTrip.maxDays || 7);
            const budgetChanged = editBudgetEur() !== trip.currentTrip.budgetEur;
            const minAgeChanged = editMinAge() !== trip.currentTrip.minAge;
            const maxAgeChanged = editMaxAge() !== trip.currentTrip.maxAge;
            const travelTypesChanged = JSON.stringify(editTravelTypes()) !== JSON.stringify((trip.currentTrip as any).travelTypes || []);
            
            const originalMedia = (trip.currentTrip as any).media || [];
            const currentMedia = editMedia();
            const hasTemporaryMedia = temporaryEditMedia().length > 0;
            const mediaOrderChanged = JSON.stringify(currentMedia.map((m: any) => m.id)) !== JSON.stringify(originalMedia.map((m: any) => m.id));
            const mediaCountChanged = currentMedia.length !== originalMedia.length;
            const hasDeletedMedia = deletedMediaIds().length > 0;
            const mediaChanged = hasTemporaryMedia || mediaOrderChanged || mediaCountChanged || hasDeletedMedia;

            setHasChanges(titleChanged || summaryChanged || startDateChanged || endDateChanged || minDaysChanged || maxDaysChanged || budgetChanged || minAgeChanged || maxAgeChanged || travelTypesChanged || mediaChanged);
        }
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const { startUpload } = createUploadThing("tripMedia", {
        onClientUploadComplete: async (res) => {
            const newMedia: any[] = [];

            for (const file of res) {
                const uploadedUrl = file.ufsUrl;
                
                if (!user.profile?.id) {
                    setUploadError("Utilisateur non connecté");
                    continue;
                }

                const result = await createTemporaryTripMedia(user.profile.id, uploadedUrl);
                
                if (result.success && result.data) {
                    newMedia.push({
                        id: result.data.id,
                        url: uploadedUrl,
                        isTemporary: true
                    });
                } else {
                    setUploadError("Erreur lors de la sauvegarde temporaire");
                    
                    try {
                        await fetch(`${backendUrl}/api/uploadthing`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: uploadedUrl })
                        });
                    } catch (deleteError) {
                        console.error("Impossible de supprimer la photo sur UploadThing:", deleteError);
                    }
                }
            }

            if (newMedia.length > 0) {
                setTemporaryEditMedia((prev) => [...prev, ...newMedia]);
                setUploadError(null);
            }
            
            setIsUploadingMedia(false);
        },
        onUploadError: (error) => {
            if (error.message.includes("FileSizeMismatch") || error.message.includes("file size")) {
                setUploadError("Vous ne pouvez pas mettre des images qui dépassent 4 Mo");
            } else {
                setUploadError(`Erreur d'upload: ${error.message}`);
            }
            setIsUploadingMedia(false);
        },
        onUploadBegin: () => {
            setIsUploadingMedia(true);
            setUploadError(null);
        },
    });

    const handleFileSelectEdit = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        const files = input.files;
        
        if (files && files.length > 0) {
            const totalMedia = editMedia().length + temporaryEditMedia().length;
            if (totalMedia + files.length > 10) {
                setUploadError("Vous ne pouvez pas ajouter plus de 10 photos");
                return;
            }

            setIsUploadingMedia(true);
            setUploadError(null);
            await startUpload(Array.from(files));
        }
    };

    const handleRemoveExistingMedia = (mediaId: string) => {
        setDeletedMediaIds((prev) => [...prev, mediaId]);
    };

    const handleRemoveTemporaryMedia = async (mediaId: string) => {
        if (!user.profile?.id) {
            setUploadError("Utilisateur non connecté");
            return;
        }

        const result = await deleteTemporaryTripMedia(mediaId, user.profile.id);
        
        if (result.success) {
            setTemporaryEditMedia((prev) => prev.filter(m => m.id !== mediaId));
        } else {
            setUploadError("Erreur lors de la suppression");
        }
    };

    const moveMediaLeft = (index: number) => {
        if (index === 0) return;
        
        const allMedia = [...editMedia(), ...temporaryEditMedia()];
        [allMedia[index], allMedia[index - 1]] = [allMedia[index - 1], allMedia[index]];
        
        const existingCount = editMedia().length;
        setEditMedia(allMedia.slice(0, existingCount));
        setTemporaryEditMedia(allMedia.slice(existingCount));
    };

    const moveMediaRight = (index: number) => {
        const allMedia = [...editMedia(), ...temporaryEditMedia()];
        if (index === allMedia.length - 1) return;
        
        [allMedia[index], allMedia[index + 1]] = [allMedia[index + 1], allMedia[index]];
        
        const existingCount = editMedia().length;
        setEditMedia(allMedia.slice(0, existingCount));
        setTemporaryEditMedia(allMedia.slice(existingCount));
    };

    const allEditMedia = () => {
        const existing = editMedia().filter(m => !deletedMediaIds().includes(m.id));
        return [...existing, ...temporaryEditMedia()];
    };

    const formatDateRange = (monthYear: any) => {
        if (typeof monthYear === 'string') {
            const match = monthYear.match(/\[(\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})\)/);
            if (match) {
                const startDate = new Date(match[1]);
                const endDate = new Date(match[2]);
                const startMonth = startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                const endMonth = endDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                
                if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
                    return startMonth;
                }
                return `${startMonth} - ${endMonth}`;
            }
        }
        return "Date à définir";
    };

    const formatBudget = (budget?: number) => {
        if (!budget) return "Budget libre";
        return `${budget.toLocaleString('fr-FR')}€`;
    };

    const getTravelTypeLabel = (slug: string) => {
        const travelType = backend.travelTypes?.find((tt: any) => tt.slug === slug);
        return travelType?.label || slug;
    };

    const isUserTrip = () => {
        return user.profile?.id === (trip.currentTrip as any)?.organizerId;
    };

    const allTravelTypes = () => {
        if (!backend.travelTypes) return [];
        if (Array.isArray(backend.travelTypes)) return backend.travelTypes;
        return [];
    };

    const toggleTravelType = (slug: string) => {
        if (editTravelTypes().includes(slug)) {
            if (editTravelTypes().length > 3) {
                setEditTravelTypes(editTravelTypes().filter(s => s !== slug));
            }
        } else {
            setEditTravelTypes([...editTravelTypes(), slug]);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setHasChanges(false);
        setDeletedMediaIds([]);
        if (startDatePicker) {
            startDatePicker.destroy();
            startDatePicker = undefined;
        }
        if (endDatePicker) {
            endDatePicker.destroy();
            endDatePicker = undefined;
        }
    };

    const handleSave = async () => {
        if (!trip.currentTrip?.id) return;

        const allMedia = allEditMedia();

        for (const mediaId of deletedMediaIds()) {
            const result = await deleteTripMedia(mediaId);
            if (!result.success) {
                setUploadError("Erreur lors de la suppression d'une photo");
                return;
            }
        }

        const positionUpdates = allMedia
            .filter(media => !media.isTemporary)
            .map((media, index) => ({
                id: String(media.id),
                position: index + 1
            }));

        if (positionUpdates.length > 0) {
            const posResult = await updateTripMediaPositions(positionUpdates);
            if (!posResult.success) {
                setUploadError("Erreur lors de la mise à jour des positions");
                return;
            }
        }

        const updateData = {
            title: editTitle(),
            summary: editSummary() || undefined,
            startDate: editStartDate(),
            endDate: editEndDate(),
            minDays: editMinDays(),
            maxDays: editMaxDays(),
            budgetEur: editBudgetEur(),
            minAge: editMinAge(),
            maxAge: editMaxAge(),
            travelTypes: editTravelTypes(),
            temporaryMediaIds: temporaryEditMedia().map(m => String(m.id))
        };

        const result = await updateTrip(trip.currentTrip.id, updateData);

        if (result.success) {
            await getTripById(trip.currentTrip.id);
            setIsEditing(false);
            setHasChanges(false);
            setEditMedia([]);
            setTemporaryEditMedia([]);
            setDeletedMediaIds([]);
            if (startDatePicker) {
                startDatePicker.destroy();
                startDatePicker = undefined;
            }
            if (endDatePicker) {
                endDatePicker.destroy();
                endDatePicker = undefined;
            }
        } else {
            setUploadError("Erreur lors de la sauvegarde");
        }
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

                                <div>
                                    <div class="flex items-start justify-between gap-4 mb-4">
                                        <Show when={!isEditing()} fallback={
                                            <input
                                                type="text"
                                                value={editTitle()}
                                                onInput={(e) => setEditTitle(e.target.value)}
                                                class="flex-1 text-3xl font-bold text-color-dark px-4 py-2 border-2 border-color-main rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main bg-white"
                                                placeholder="Titre du voyage"
                                            />
                                        }>
                                            <h1 class="text-3xl font-bold text-color-dark truncate">
                                                {trip.currentTrip?.title}
                                            </h1>
                                        </Show>
                                        <Show when={isUserTrip() && !isEditing()}>
                                            <div class="bg-color-main px-4 py-2 rounded-full flex-shrink-0">
                                                <span class="text-sm font-bold text-white">Mon voyage</span>
                                            </div>
                                        </Show>
                                    </div>
                                    <div class="flex flex-wrap gap-4">
                                        <div class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-color-dark">
                                            <MapPin size={18} class="text-color-main" />
                                            <span class="font-medium">{trip.currentTrip?.destinationCountry}</span>
                                        </div>
                                        <Show when={!isEditing()} fallback={
                                            <div class="flex gap-2">
                                                <input
                                                    ref={startDateInput}
                                                    type="text"
                                                    placeholder="Date début"
                                                    readonly
                                                    class="px-4 py-3 border-2 border-color-main rounded-xl bg-white text-color-dark cursor-pointer"
                                                />
                                                <input
                                                    ref={endDateInput}
                                                    type="text"
                                                    placeholder="Date fin"
                                                    readonly
                                                    class="px-4 py-3 border-2 border-color-main rounded-xl bg-white text-color-dark cursor-pointer"
                                                />
                                            </div>
                                        }>
                                            <div class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-color-dark">
                                                <Calendar size={18} class="text-color-main" />
                                                <span class="font-medium">{formatDateRange(trip.currentTrip?.monthYear)}</span>
                                            </div>
                                        </Show>
                                        <Show when={!isEditing()} fallback={
                                            <div class="flex gap-2 items-center">
                                                <input
                                                    type="number"
                                                    value={editMinDays()}
                                                    onInput={(e) => setEditMinDays(Number(e.target.value))}
                                                    class="w-20 px-3 py-3 border-2 border-color-main rounded-xl bg-white text-color-dark"
                                                    min="1"
                                                />
                                                <span class="text-color-dark">-</span>
                                                <input
                                                    type="number"
                                                    value={editMaxDays()}
                                                    onInput={(e) => setEditMaxDays(Number(e.target.value))}
                                                    class="w-20 px-3 py-3 border-2 border-color-main rounded-xl bg-white text-color-dark"
                                                    min={editMinDays()}
                                                />
                                                <span class="text-color-dark">jours</span>
                                            </div>
                                        }>
                                            <div class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-color-dark">
                                                <Clock size={18} class="text-color-main" />
                                                <span class="font-medium">
                                                    {trip.currentTrip?.minDays === trip.currentTrip?.maxDays 
                                                        ? `${trip.currentTrip?.minDays} jours` 
                                                        : `${trip.currentTrip?.minDays}-${trip.currentTrip?.maxDays} jours`}
                                                </span>
                                            </div>
                                        </Show>
                                    </div>
                                </div>

                                <Show when={trip.currentTrip?.summary || isEditing()}>
                                    <div class="bg-white rounded-2xl shadow-md p-6">
                                        <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                                            <FileText size={24} class="text-color-main" />
                                            Description du voyage
                                        </h2>
                                        <Show when={!isEditing()} fallback={
                                            <textarea
                                                value={editSummary()}
                                                onInput={(e) => setEditSummary(e.target.value)}
                                                class="w-full px-4 py-3 border-2 border-color-main rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main bg-white text-color-dark resize-none"
                                                rows={6}
                                                placeholder="Décrivez votre voyage..."
                                            />
                                        }>
                                            <p class="text-color-dark opacity-80 whitespace-pre-line">
                                                {trip.currentTrip?.summary}
                                            </p>
                                        </Show>
                                    </div>
                                </Show>

                                <Show when={(trip.currentTrip as any).travelTypes?.length > 0 || isEditing()}>
                                    <div class="bg-white rounded-2xl shadow-md p-6">
                                        <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                                            <Compass size={24} class="text-color-main" />
                                            Types de voyage
                                        </h2>
                                        <Show when={!isEditing()} fallback={
                                            <div>
                                                <Show when={editTravelTypes().length > 0}>
                                                    <div class="flex flex-wrap gap-2 mb-4">
                                                        <For each={editTravelTypes()}>
                                                            {(slug) => {
                                                                const tt = allTravelTypes().find(t => t.slug === slug);
                                                                return (
                                                                    <div class="flex items-center gap-2 px-3 py-2 rounded-full bg-color-main text-white text-sm font-medium">
                                                                        <span>{tt?.label}</span>
                                                                    </div>
                                                                );
                                                            }}
                                                        </For>
                                                    </div>
                                                </Show>
                                                <button
                                                    type="button"
                                                    onclick={() => editTripTravelTypesModal?.showModal()}
                                                    class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-color-main transition cursor-pointer flex items-center justify-center gap-2 text-gray-500 hover:text-color-main"
                                                >
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span>Modifier les types de voyage</span>
                                                </button>
                                            </div>
                                        }>
                                            <div class="flex flex-wrap gap-3">
                                                <For each={(trip.currentTrip as any).travelTypes}>
                                                    {(slug: string) => (
                                                        <div class="inline-flex items-center bg-color-light text-color-main rounded-xl px-4 py-3 font-medium">
                                                            {getTravelTypeLabel(slug)}
                                                        </div>
                                                    )}
                                                </For>
                                            </div>
                                        </Show>
                                    </div>
                                </Show>

                                <div class="bg-white rounded-2xl shadow-md p-6">
                                    <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                                        <Image size={24} class="text-color-main" />
                                        Photos du voyage
                                    </h2>
                                    
                                    <Show when={!isEditing()}>
                                        <Show 
                                            when={(trip.currentTrip as any)?.media && (trip.currentTrip as any).media.length > 0}
                                            fallback={
                                                <div class="text-center py-8">
                                                    <p class="text-color-dark opacity-50">Aucune photo pour le moment</p>
                                                </div>
                                            }
                                        >
                                            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <For each={(trip.currentTrip as any).media}>
                                                    {(media: any) => (
                                                        <div class="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-white">
                                                            <img 
                                                                src={media.url} 
                                                                alt="Photo du voyage" 
                                                                class="w-full h-full object-cover block"
                                                            />
                                                        </div>
                                                    )}
                                                </For>
                                            </div>
                                        </Show>
                                    </Show>

                                    <Show when={isEditing()}>
                                        <div>
                                            <Show when={allEditMedia().length > 0}>
                                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                                    <For each={allEditMedia()}>
                                                        {(media, index) => (
                                                            <div class="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-white">
                                                                <img 
                                                                    src={media.url} 
                                                                    alt="Photo du voyage" 
                                                                    class="w-full h-full object-cover block"
                                                                />
                                                                <div class="absolute inset-0 group-hover:bg-black/60 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                                                                    <div class="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-300">
                                                                        <button
                                                                            onClick={() => moveMediaLeft(index())}
                                                                            disabled={index() === 0}
                                                                            class="bg-white text-color-main p-2 rounded-full hover:bg-color-main hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        >
                                                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => moveMediaRight(index())}
                                                                            disabled={index() === allEditMedia().length - 1}
                                                                            class="bg-white text-color-main p-2 rounded-full hover:bg-color-main hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        >
                                                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => media.isTemporary ? handleRemoveTemporaryMedia(media.id) : handleRemoveExistingMedia(media.id)}
                                                                        class="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all pointer-events-auto"
                                                                    >
                                                                        <X size={20} />
                                                                    </button>
                                                                </div>
                                                                <Show when={index() === 0}>
                                                                    <div class="absolute top-2 left-2 bg-color-main px-2 py-1 rounded-full">
                                                                        <span class="text-xs font-bold text-white">Photo principale</span>
                                                                    </div>
                                                                </Show>
                                                            </div>
                                                        )}
                                                    </For>
                                                </div>
                                            </Show>

                                            <Show when={allEditMedia().length < 10}>
                                                <label class="w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-color-main transition-all cursor-pointer flex items-center justify-center gap-3 text-gray-500 hover:text-color-main">
                                                    <Camera size={24} />
                                                    <span>Ajouter des photos ({allEditMedia().length}/10)</span>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        multiple
                                                        class="hidden" 
                                                        onChange={handleFileSelectEdit}
                                                        disabled={isUploadingMedia()}
                                                    />
                                                </label>
                                            </Show>

                                            <Show when={isUploadingMedia()}>
                                                <div class="mt-4 flex items-center justify-center gap-3 text-color-main">
                                                    <span class="loading loading-spinner loading-md"></span>
                                                    <span class="font-semibold">Upload en cours...</span>
                                                </div>
                                            </Show>

                                            <Show when={uploadError()}>
                                                <div class="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center">
                                                    {uploadError()}
                                                </div>
                                            </Show>
                                        </div>
                                    </Show>
                                </div>

                                <div class="bg-white rounded-2xl shadow-md p-6">
                                    <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                                        <Users size={24} class="text-color-main" />
                                        Participants
                                        <Show when={tripMembers().length > 0}>
                                            <span class="bg-color-main text-white text-sm px-3 py-1 rounded-full">
                                                {tripMembers().length}
                                            </span>
                                        </Show>
                                    </h2>

                                    <Show when={isUserTrip()}>
                                        <div class="flex gap-2 border-b border-gray-200 mb-4">
                                            <button
                                                onClick={() => setActiveTab('members')}
                                                class={`px-4 py-2 font-semibold transition-all ${
                                                    activeTab() === 'members'
                                                        ? 'text-color-main border-b-2 border-color-main'
                                                        : 'text-gray-500 hover:text-color-dark'
                                                }`}
                                            >
                                                Membres ({tripMembers().length})
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('pending')}
                                                class={`px-4 py-2 font-semibold transition-all relative ${
                                                    activeTab() === 'pending'
                                                        ? 'text-color-main border-b-2 border-color-main'
                                                        : 'text-gray-500 hover:text-color-dark'
                                                }`}
                                            >
                                                Demandes ({pendingRequests().length})
                                                <Show when={pendingRequests().length > 0}>
                                                    <span class="absolute -top-1 -right-1 w-2 h-2 bg-color-secondary rounded-full"></span>
                                                </Show>
                                            </button>
                                        </div>

                                        <Show when={activeTab() === 'members'}>
                                            <Show 
                                                when={tripMembers().length > 0}
                                                fallback={
                                                    <div class="text-center py-8">
                                                        <Users2 size={48} class="text-gray-300 mx-auto mb-2" />
                                                        <p class="text-gray-500">Aucun membre pour le moment</p>
                                                    </div>
                                                }
                                            >
                                                <div class="space-y-3 max-h-64 overflow-y-auto">
                                                    <For each={tripMembers()}>
                                                        {(member) => (
                                                            <div onClick={() => navigate(`/user/${member.user?.id}`)}     class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 hover:border-color-main transition-all">
                                                                <div class="w-14 h-14 rounded-full bg-color-main flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                    <Show 
                                                                        when={member.user?.profilePictureUrl}
                                                                        fallback={
                                                                            <span class="text-white font-bold text-2xl">
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
                                                                    <p class="font-semibold text-lg text-color-dark truncate">{member.user?.username}</p>
                                                                    <p class="text-sm text-gray-500">
                                                                        Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </For>
                                                </div>
                                            </Show>
                                        </Show>

                                        <Show when={activeTab() === 'pending'}>
                                            <Show 
                                                when={pendingRequests().length > 0}
                                                fallback={
                                                    <div class="text-center py-8">
                                                        <Clock size={48} class="text-gray-300 mx-auto mb-2" />
                                                        <p class="text-gray-500">Aucune demande en attente</p>
                                                    </div>
                                                }
                                            >
                                                <div class="space-y-3 max-h-64 overflow-y-auto">
                                                    <For each={pendingRequests()}>
                                                        {(request) => (
                                                            <div class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
                                                                <div 
                                                                    onClick={() => navigate(`/user/${request.user?.id}`)}
                                                                    class="flex items-center gap-3 flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-all"
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
                                                                        <p class="font-semibold text-lg text-color-dark truncate">{request.user?.username}</p>
                                                                        <p class="text-sm text-gray-500">
                                                                            {new Date(request.joinedAt).toLocaleDateString('fr-FR')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div class="flex gap-2 flex-shrink-0">
                                                                    <button
                                                                        onClick={() => handleAcceptMember(request.user.id)}
                                                                        class="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                                                        style="background-color: #45AF95;"
                                                                    >
                                                                        <Check size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeclineMember(request.user.id)}
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
                                        </Show>
                                    </Show>

                                    <Show when={!isUserTrip()}>
                                        <Show 
                                            when={tripMembers().length > 0}
                                            fallback={
                                                <div class="text-center py-8">
                                                    <Users2 size={48} class="text-gray-300 mx-auto mb-2" />
                                                    <p class="text-gray-500">Soyez le premier à rejoindre !</p>
                                                </div>
                                            }
                                        >
                                            <div class="space-y-2">
                                                <For each={tripMembers()}>
                                                    {(member) => (
                                                        <div onClick={() => navigate(`/user/${member.user?.id}`)}     class="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-all">
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
                                                            <p class="text-base text-color-dark">{member.user?.username}</p>
                                                        </div>
                                                    )}
                                                </For>
                                            </div>
                                        </Show>
                                    </Show>
                                </div>
                                {/** 
                                <div class="bg-white rounded-2xl shadow-md p-6">
                                    <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                                        <MessageSquare size={24} class="text-color-main" />
                                        Questions & Réponses
                                    </h2>
                                    <div class="text-center py-8">
                                        <p class="text-color-dark opacity-50">À venir prochainement</p>
                                    </div>
                                </div>
                                */}
                            </div>

                            <div class="lg:col-span-1 space-y-6">
                                <div class="bg-white rounded-2xl shadow-lg sticky top-20 z-10 p-6">
                                    <div class="pb-4 border-b border-gray-200">
                                        <p class="text-color-dark text-sm mb-2">Budget estimé</p>
                                        <Show when={!isEditing()} fallback={
                                            <input
                                                type="number"
                                                value={editBudgetEur() || ""}
                                                onInput={(e) => setEditBudgetEur(e.target.value ? Number(e.target.value) : undefined)}
                                                class="w-full text-3xl font-bold text-color-main px-4 py-2 border-2 border-color-main rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main bg-white"
                                                placeholder="Budget"
                                                min="0"
                                            />
                                        }>
                                            <p class="text-3xl font-bold text-color-main">
                                                {formatBudget(trip.currentTrip?.budgetEur)}
                                            </p>
                                        </Show>
                                        <Show when={trip.currentTrip?.budgetEur && !isEditing()}>
                                            <p class="text-sm text-gray-500">par personne</p>
                                        </Show>
                                    </div>

                                    <div class="space-y-3 py-4">
                                        <div class="flex justify-between text-sm">
                                            <span class="text-color-dark flex items-center gap-2">
                                                <Calendar size={16} class="text-color-secondary" />
                                                Période
                                            </span>
                                            <span class="font-medium text-color-dark">
                                                {formatDateRange(trip.currentTrip?.monthYear)}
                                            </span>
                                        </div>
                                        <div class="flex justify-between text-sm">
                                            <span class="text-color-dark flex items-center gap-2">
                                                <Clock size={16} class="text-color-secondary" />
                                                Durée
                                            </span>
                                            <span class="font-medium text-color-dark">
                                                {trip.currentTrip?.minDays === trip.currentTrip?.maxDays 
                                                    ? `${trip.currentTrip?.minDays} jours` 
                                                    : `${trip.currentTrip?.minDays}-${trip.currentTrip?.maxDays} jours`}
                                            </span>
                                        </div>
                                        <Show when={trip.currentTrip?.minAge || trip.currentTrip?.maxAge || isEditing()}>
                                            <div class="flex justify-between text-sm items-center">
                                                <span class="text-color-dark flex items-center gap-2">
                                                    <Users size={16} class="text-color-secondary" />
                                                    Âges
                                                </span>
                                                <Show when={!isEditing()} fallback={
                                                    <div class="flex gap-2 items-center">
                                                        <input
                                                            type="number"
                                                            value={editMinAge() || ""}
                                                            onInput={(e) => setEditMinAge(e.target.value ? Number(e.target.value) : undefined)}
                                                            class="w-16 px-2 py-1 border-2 border-color-main rounded-lg bg-white text-color-dark text-xs"
                                                            placeholder="Min"
                                                            min="18"
                                                            max="99"
                                                        />
                                                        <span>-</span>
                                                        <input
                                                            type="number"
                                                            value={editMaxAge() || ""}
                                                            onInput={(e) => setEditMaxAge(e.target.value ? Number(e.target.value) : undefined)}
                                                            class="w-16 px-2 py-1 border-2 border-color-main rounded-lg bg-white text-color-dark text-xs"
                                                            placeholder="Max"
                                                            min="18"
                                                            max="99"
                                                        />
                                                    </div>
                                                }>
                                                    <span class="font-medium text-color-dark">
                                                        {trip.currentTrip?.minAge && trip.currentTrip?.maxAge 
                                                            ? `${trip.currentTrip?.minAge}-${trip.currentTrip?.maxAge} ans`
                                                            : trip.currentTrip?.minAge 
                                                            ? `${trip.currentTrip?.minAge}+ ans`
                                                            : `${trip.currentTrip?.maxAge} ans max`}
                                                    </span>
                                                </Show>
                                            </div>
                                        </Show>
                                    </div>

                                    <div class="flex flex-col gap-4">
                                        <Show when={!isUserTrip()}>
                                            <Show 
                                                when={memberStatus() === null}
                                                fallback={
                                                    <Show when={memberStatus() === 'PENDING'}>
                                                        <button class="flex-1 bg-gray-300 text-gray-600 py-3 rounded-xl font-semibold cursor-not-allowed" disabled>
                                                            Demande en attente
                                                        </button>
                                                    </Show>
                                                }
                                            >
                                                <button 
                                                    onClick={handleRequestToJoin}
                                                    disabled={isRequesting()}
                                                    class="flex-1 bg-color-main text-white py-3 rounded-xl font-semibold hover:bg-gradient-main transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <Show when={!isRequesting()} fallback={<span class="loading loading-spinner loading-sm"></span>}>
                                                        <>
                                                            <Users size={20} />
                                                            Demander à participer
                                                        </>
                                                    </Show>
                                                </button>
                                            </Show>
                                        </Show>
                                        <Show when={!isUserTrip()}>
                                            <button 
                                                onClick={() => {
                                                    const modal = document.getElementById('ask_question_modal') as HTMLDialogElement;
                                                    modal?.showModal();
                                                }}
                                                class="flex-1 border-2 border-color-main text-color-main py-3 rounded-xl font-semibold hover:bg-color-light transition-all hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle size={20} />
                                                Poser une question
                                            </button>
                                        </Show>
                                    </div>

                                    <Show when={!isUserTrip() && userQuestions().length > 0}>
                                        <div class="bg-white rounded-2xl shadow-md p-6 mt-6">
                                            <h3 class="font-bold text-color-dark text-xl mb-4 flex items-center gap-2">
                                                <MessageCircle size={24} class="text-color-main" />
                                                Vos questions
                                            </h3>
                                            <Show 
                                                when={!isLoadingQuestions()}
                                                fallback={
                                                    <div class="flex justify-center py-8">
                                                        <span class="loading loading-spinner loading-lg text-color-main"></span>
                                                    </div>
                                                }
                                            >
                                                <div class="space-y-4 overflow-scroll max-h-92">
                                                    <For each={userQuestions()}>
                                                        {(message) => {
                                                            const relatedAnswer = () => {
                                                                if (message.questionData?.type === 'question') {
                                                                    return userQuestions().find(m => 
                                                                        m.questionData?.type === 'answer' && 
                                                                        m.questionData?.relatedQuestionId === message.id
                                                                    );
                                                                }
                                                                return null;
                                                            };

                                                            return (
                                                                <Show when={message.questionData?.type === 'question'}>
                                                                    <div class="border-2 border-gray-200 rounded-xl p-4">
                                                                        <div class="flex items-start gap-3 mb-3">
                                                                            <MessageSquare size={20} class="text-color-secondary flex-shrink-0 mt-1" />
                                                                            <div class="flex-1">
                                                                                <p class="text-sm font-semibold text-color-secondary mb-1">Votre question</p>
                                                                                <p class="text-color-dark whitespace-pre-line">{message.content}</p>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <Show 
                                                                            when={relatedAnswer()}
                                                                            fallback={
                                                                                <div class="ml-8 pl-4 border-l-2 border-gray-200">
                                                                                    <p class="text-sm text-gray-500 italic">En attente de réponse...</p>
                                                                                </div>
                                                                            }
                                                                        >
                                                                            {(answer) => (
                                                                                <div class="ml-8 pl-4 border-l-2 border-green-500 bg-green-50 rounded-r-lg p-3">
                                                                                    <p class="text-sm font-semibold text-green-700 mb-1">
                                                                                        Réponse de {answer().sender.username}
                                                                                    </p>
                                                                                    <p class="text-color-dark whitespace-pre-line">{answer().content}</p>
                                                                                </div>
                                                                            )}
                                                                        </Show>
                                                                    </div>
                                                                </Show>
                                                            );
                                                        }}
                                                    </For>
                                                </div>
                                            </Show>
                                        </div>
                                    </Show>
                                    <Show when={isUserTrip() && !isEditing()}>
                                        <button 
                                            onClick={handleEdit}
                                            class="w-full bg-color-main hover:bg-gradient-main text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg active:scale-95 mb-3"
                                        >
                                            <Edit size={20} />
                                            Modifier
                                        </button>
                                        <A href={"/conversations"}
                                            onClick={openQuestionModal}
                                            class="w-full border-2 border-gray-300 text-color-dark py-3 rounded-xl font-semibold hover:bg-color-light hover:border-[#146865] transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-md active:scale-95">
                                            <MessageCircle size={20} />
                                            Voir les questions
                                        </A>
                                    </Show>

                                    <Show when={isUserTrip() && isEditing()}>
                                        <button
                                            onClick={handleCancel}
                                            class="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 mb-3"
                                        >
                                            <X size={20} />
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!hasChanges()}
                                            class={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                                                hasChanges()
                                                    ? 'bg-color-main text-white hover:bg-gradient-main hover:scale-105 cursor-pointer'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <Check size={20} />
                                            Sauvegarder
                                        </button>
                                    </Show>
                                </div>

                                <div class="bg-white rounded-2xl shadow-md p-6">
                                    <h3 class="font-bold text-color-dark mb-4 flex items-center gap-2">
                                        <User size={20} class="text-color-main" />
                                        Organisé par
                                    </h3>
                                    <Show 
                                        when={organizer()}
                                        fallback={
                                            <div class="flex items-center justify-center py-4">
                                                <span class="loading loading-spinner loading-md text-color-main"></span>
                                            </div>
                                        }
                                    >
                                        <div onClick={() => navigate(`/user/${organizer()?.id}`)}     class="flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-xl p-3 -m-3 transition-all">
                                            <div class="w-14 h-14 rounded-full bg-color-main border-2 border-black/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                <Show 
                                                    when={organizer()?.profilePictureUrl}
                                                    fallback={
                                                        <span class="text-white font-bold text-2xl">
                                                            {organizer()?.username[0]?.toUpperCase()}
                                                        </span>
                                                    }
                                                >
                                                    <img 
                                                        src={organizer()?.profilePictureUrl} 
                                                        alt={organizer()?.username}
                                                        class="w-full h-full object-cover"
                                                    />
                                                </Show>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex items-center gap-2">
                                                    <h4 class="font-bold text-color-dark text-lg">{organizer()?.username}</h4>
                                                    <Show when={organizer()?.isVerified}>
                                                        <UserCheck size={16} class="text-color-secondary" />
                                                    </Show>
                                                </div>
                                                <Show when={organizer()?.city || organizer()?.country}>
                                                    <p class="text-sm text-gray-600">
                                                        {[organizer()?.city, organizer()?.country].filter(Boolean).join(', ')}
                                                    </p>
                                                </Show>

                                                <Show when={organizer()?.description}>
                                                    <p class="text-sm text-gray-700 mt-2 line-clamp-2">
                                                        {organizer()?.description}
                                                    </p>
                                                </Show>
                                            </div>
                                        </div>
                                    </Show>
                                </div>

                                <div class="bg-white rounded-2xl shadow-md p-6">
                                    <h3 class="font-bold text-color-dark mb-4">Partager ce voyage</h3>
                                    <button class="w-full border-2 border-gray-300 text-color-dark py-3 rounded-xl font-semibold hover:bg-color-light hover:border-[#146865] transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-md active:scale-95">
                                        <Share2 size={20} />
                                        Partager
                                    </button>
                                    <p class="text-xs text-center text-gray-500 mt-2">
                                        À venir prochainement
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <dialog id="edit_trip_travel_types_modal" ref={editTripTravelTypesModal} class="modal">
                    <div class="modal-box max-w-4xl bg-white">
                        <h3 class="font-bold text-2xl text-color-dark mb-6">Choisissez vos types de voyage</h3>
                        <p class="text-gray-600 mb-6">Sélectionnez au moins 3 types correspondant à votre aventure</p>
                        
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                            <For each={allTravelTypes()}>
                                {(type) => (
                                    <button
                                        type="button"
                                        onClick={() => toggleTravelType(type.slug)}
                                        class={`p-4 rounded-xl font-medium transition text-left ${
                                            editTravelTypes().includes(type.slug)
                                                ? 'bg-color-main text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                )}
                            </For>
                        </div>

                        <div class="modal-action">
                            <form method="dialog">
                                <button class="btn bg-color-main text-white hover:bg-gradient-main border-0">
                                    Confirmer ({editTravelTypes().length})
                                </button>
                            </form>
                        </div>
                    </div>
                    <form method="dialog" class="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
                <dialog id="ask_question_modal" class="modal">
                    <div class="modal-box max-w-lg bg-white">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-2xl text-color-dark">Poser une question</h3>
                            <form method="dialog">
                                <button class="btn btn-sm btn-circle btn-ghost">
                                    <X size={20} />
                                </button>
                            </form>
                        </div>
                        <p class="text-gray-600 mb-6">
                            Votre question sera envoyée à l'organisateur. Vous pourrez voir sa réponse sur cette page.
                        </p>
                        
                        <textarea
                            value={questionText()}
                            onInput={(e) => setQuestionText(e.currentTarget.value)}
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main transition-colors bg-white text-color-dark resize-none"
                            rows={5}
                            placeholder="Écrivez votre question ici..."
                            disabled={isSendingQuestion()}
                        />

                        <Show when={questionStatus().message}>
                            <div class={`mt-4 text-sm text-center font-semibold p-3 rounded-lg ${
                                questionStatus().type === 'success' ? 'bg-color-main text-white' : 'bg-red-100 text-red-700'
                            }`}>
                                {questionStatus().message}
                            </div>
                        </Show>

                        <div class="modal-action">
                            <form method="dialog">
                                <button class="btn btn-ghost" disabled={isSendingQuestion()}>Annuler</button>
                            </form>
                            <button
                                class="btn bg-color-main text-white hover:bg-gradient-main border-0"
                                onClick={handleSendQuestion}
                                disabled={!questionText().trim() || isSendingQuestion()}
                            >
                                <Show when={!isSendingQuestion()} fallback={<span class="loading loading-spinner loading-sm"></span>}>
                                    Envoyer
                                </Show>
                            </button>
                        </div>
                    </div>
                    <form method="dialog" class="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
            </Show>
        </Show>
    );
};

export default VoyageDetailPage;