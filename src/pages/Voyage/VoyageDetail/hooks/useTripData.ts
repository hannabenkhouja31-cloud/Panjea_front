import { createSignal, onMount } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";

import type { TripMember, PendingRequest, Organizer } from "../types";
import { user } from "../../../../stores/userStore";
import { getTripById, trip } from "../../../../stores/tripStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useTripData = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [isLoading, setIsLoading] = createSignal(true);
    const [organizer, setOrganizer] = createSignal<Organizer | null>(null);
    const [tripMembers, setTripMembers] = createSignal<TripMember[]>([]);
    const [pendingRequests, setPendingRequests] = createSignal<PendingRequest[]>([]);
    const [memberStatus, setMemberStatus] = createSignal<string | null>(null);

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
                
                const isUserTrip = user.profile.id === (trip.currentTrip as any).organizerId;
                if (isUserTrip) {
                    await loadPendingRequests(trip.currentTrip.id, user.profile.id);
                }
            }
        }
    });

    return {
        isLoading,
        organizer,
        tripMembers,
        pendingRequests,
        memberStatus,
        loadTripMembers,
        loadPendingRequests,
        checkMemberStatus
    };
};