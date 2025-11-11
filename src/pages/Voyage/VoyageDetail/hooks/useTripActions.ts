import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import type { Message } from "../../../../models";
import { user } from "../../../../stores/userStore";
import { getMessagesByTripId, markTripQuestionsAsRead, messagesStore } from "../../../../stores/messagesStore";
import { deleteTrip, trip } from "../../../../stores/tripStore";


const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useTripActions = () => {
    const navigate = useNavigate();
    const [isRequesting, setIsRequesting] = createSignal(false);
    const [isDeletingTrip, setIsDeletingTrip] = createSignal(false);
    const [questionText, setQuestionText] = createSignal("");
    const [isSendingQuestion, setIsSendingQuestion] = createSignal(false);
    const [questionStatus, setQuestionStatus] = createSignal<{ message: string, type: 'success' | 'error' | '' }>({ message: '', type: '' });
    const [userQuestions, setUserQuestions] = createSignal<Message[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = createSignal(false);

    const loadUserQuestions = async (tripId: string) => {
        if (!user.profile?.id) return;
        
        setIsLoadingQuestions(true);
        try {
            await getMessagesByTripId(tripId, user.profile.id, 1, false);
            await markTripQuestionsAsRead(tripId, user.profile.id);
            
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
                body: JSON.stringify({ userId: user.profile.id })
            });
            
            if (response.status === 201) {
                return 'PENDING';
            }
        } catch (error) {
            console.error("Erreur demande:", error);
        } finally {
            setIsRequesting(false);
        }
        return null;
    };

    const handleSendQuestion = async () => {
        if (!user.profile?.id || !trip.currentTrip?.id || !questionText().trim()) return;

        setIsSendingQuestion(true);
        setQuestionStatus({ message: '', type: '' });

        try {
            const response = await fetch(`${backendUrl}/trips/${trip.currentTrip.id}/ask-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: questionText().trim(),
                    askerId: user.profile.id
                })
            });

            if (response.ok) {
                setQuestionStatus({ message: "Votre question a été envoyée à l'organisateur !", type: 'success' });
                setQuestionText("");
                setTimeout(() => {
                    (document.getElementById('ask_question_modal') as any)?.close();
                }, 1000);
                await loadUserQuestions(trip.currentTrip!.id);
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

    const confirmDeleteTrip = async () => {
        if (!trip.currentTrip?.id) return;

        setIsDeletingTrip(true);
        const result = await deleteTrip(trip.currentTrip.id);

        if (result.success) {
            navigate("/voyage?refresh=true", { replace: true });
        } else {
            console.error("Erreur suppression:", result.error);
            setIsDeletingTrip(false);
        }
    };

    const handleAcceptMember = async (userId: string, tripId: string, organizerId: string, loadTripMembers: Function, loadPendingRequests: Function) => {
        try {
            const response = await fetch(`${backendUrl}/trip-members/${tripId}/accept/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizerId })
            });
            
            if (response.status === 200) {
                await loadTripMembers(tripId);
                await loadPendingRequests(tripId, organizerId);
            }
        } catch (error) {
            console.error("Erreur acceptation:", error);
        }
    };

    const handleDeclineMember = async (userId: string, tripId: string, organizerId: string, loadPendingRequests: Function) => {
        try {
            const response = await fetch(`${backendUrl}/trip-members/${tripId}/decline/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizerId })
            });
            
            if (response.status === 200) {
                await loadPendingRequests(tripId, organizerId);
            }
        } catch (error) {
            console.error("Erreur refus:", error);
        }
    };

    return {
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
    };
};