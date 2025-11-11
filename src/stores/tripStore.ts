import { createStore } from "solid-js/store";
import { startLoading, stopLoading } from "./loaderStore";
import type { Trip } from "../models";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface TripStore {
  trips: Trip[];
  currentTrip: Trip | null;
  organizerTrips: Trip[];
  tripsMeta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
}


const [trip, setTrip] = createStore<TripStore>({
  trips: [],
  currentTrip: null,
  organizerTrips: [],
  tripsMeta: null,
});

const createTemporaryTripMedia = async (userId: string, url: string) => {
  try {
    const response = await fetch(backendUrl + "/temporary-trip-media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, url }),
    });

    if (response.status === 201) {
      const media = await response.json();
      return { success: true, data: media };
    } else {
      return { success: false, error: "Erreur lors de la sauvegarde temporaire" };
    }
  } catch (error) {
    console.error("Impossible de sauvegarder le média temporaire : ", error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const deleteTemporaryTripMedia = async (id: string, userId: string) => {
  try {
    const response = await fetch(backendUrl + `/temporary-trip-media/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (response.status === 204) {
      return { success: true };
    } else {
      return { success: false, error: "Erreur lors de la suppression" };
    }
  } catch (error) {
    console.error("Impossible de supprimer le média temporaire : ", error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const createTrip = async (tripData: {
  title: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  minDays: number;
  maxDays: number;
  organizerId: string;
  travelTypes?: string[];
  summary?: string;
  budgetEur?: number;
  minAge?: number;
  maxAge?: number;
  temporaryMediaIds?: string[];
}) => {
  try {
    startLoading();

    const response = await fetch(backendUrl + "/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tripData),
    });

    if (response.status === 201) {
      const createdTrip = await response.json();
      stopLoading();
      return { success: true, data: createdTrip };
    } else {
      stopLoading();
      return { success: false, error: "Erreur lors de la création du voyage" };
    }
  } catch (error) {
    console.error("Impossible de créer le voyage : ", error);
    stopLoading();
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const getAllTrips = async (page: number = 1, append: boolean = false) => {
  try {
    const response = await fetch(backendUrl + `/trips?page=${page}&limit=15&sortBy=createdAt&order=desc`);

    if (response.status === 200) {
      const paginatedData = await response.json();
      
      if (append) {
        setTrip("trips", [...trip.trips, ...paginatedData.data]);
      } else {
        setTrip("trips", paginatedData.data);
      }
      
      setTrip("tripsMeta", paginatedData.meta);
      
      return { success: true, data: paginatedData };
    } else {
      return { success: false, error: "Erreur lors de la récupération des voyages" };
    }
  } catch (error) {
    console.error("Impossible de récupérer les voyages : ", error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const getTripById = async (id: string) => {
  try {
    const response = await fetch(backendUrl + `/trips/${id}`);

    if (response.status === 200) {
      const tripData = await response.json();
      setTrip("currentTrip", tripData);
      return { success: true, data: tripData };
    } else if (response.status === 404) {
      return { success: false, error: "Voyage non trouvé" };
    } else {
      return { success: false, error: "Erreur lors de la récupération du voyage" };
    }
  } catch (error) {
    console.error("Impossible de récupérer le voyage : ", error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const updateTrip = async (id: string, updateData: {
  title?: string;
  destinationCountry?: string;
  startDate?: string;
  endDate?: string;
  minDays?: number;
  maxDays?: number;
  travelTypes?: string[];
  summary?: string;
  budgetEur?: number;
  minAge?: number;
  maxAge?: number;
  temporaryMediaIds?: string[];
}) => {
  try {
    startLoading();

    const response = await fetch(backendUrl + `/trips/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (response.status === 200) {
      const updatedTrip = await response.json();
      
      if (trip.currentTrip?.id === id) {
        setTrip("currentTrip", updatedTrip);
      }

      const tripIndex = trip.trips.findIndex(t => t.id === id);
      if (tripIndex !== -1) {
        setTrip("trips", tripIndex, updatedTrip);
      }

      stopLoading();
      return { success: true, data: updatedTrip };
    } else if (response.status === 404) {
      stopLoading();
      return { success: false, error: "Voyage non trouvé" };
    } else {
      stopLoading();
      return { success: false, error: "Erreur lors de la mise à jour du voyage" };
    }
  } catch (error) {
    console.error("Impossible de mettre à jour le voyage : ", error);
    stopLoading();
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const deleteTrip = async (id: string) => {
  try {
    startLoading();

    const response = await fetch(backendUrl + `/trips/${id}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      if (trip.currentTrip?.id === id) {
        setTrip("currentTrip", null);
      }

      setTrip("trips", trip.trips.filter(t => t.id !== id));
      setTrip("organizerTrips", trip.organizerTrips.filter(t => t.id !== id));

      const { setUserTrips, user } = await import('./userStore');
      setUserTrips(user.trips.filter(t => t.id !== id));

      stopLoading();
      return { success: true };
    } else if (response.status === 404) {
      stopLoading();
      return { success: false, error: "Voyage non trouvé" };
    } else {
      stopLoading();
      return { success: false, error: "Erreur lors de la suppression du voyage" };
    }
  } catch (error) {
    console.error("Impossible de supprimer le voyage : ", error);
    stopLoading();
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const getTripsByOrganizer = async (organizerId: string) => {
  try {
    const response = await fetch(backendUrl + `/trips/organizer/${organizerId}`);

    if (response.status === 200) {
      const tripsData = await response.json();
      setTrip("organizerTrips", tripsData);
      return { success: true, data: tripsData };
    } else {
      return { success: false, error: "Erreur lors de la récupération des voyages de l'organisateur" };
    }
  } catch (error) {
    console.error("Impossible de récupérer les voyages de l'organisateur : ", error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const deleteTripMedia = async (id: string) => {
  try {
    const response = await fetch(backendUrl + `/trip-media/${id}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      return { success: true };
    } else {
      return { success: false, error: "Erreur lors de la suppression" };
    }
  } catch (error) {
    console.error("Impossible de supprimer le média : ", error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const updateTripMediaPositions = async (updates: { id: string; position: number }[]) => {
  try {
    const response = await fetch(backendUrl + `/trip-media/positions`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false, error: "Erreur lors de la mise à jour" };
    }
  } catch (error) {
    console.error("Impossible de mettre à jour les positions : ", error);
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const clearCurrentTrip = () => {
  setTrip("currentTrip", null);
};

const clearAllTrips = () => {
  setTrip({
    trips: [],
    currentTrip: null,
    organizerTrips: [],
  });
};

export {
  trip,
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripsByOrganizer,
  clearCurrentTrip,
  clearAllTrips,
  createTemporaryTripMedia,
  deleteTemporaryTripMedia,
  deleteTripMedia,
  updateTripMediaPositions
};