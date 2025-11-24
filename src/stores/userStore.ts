import {createStore} from "solid-js/store";
import { BUDGET_LEVELS, type BudgetLevel, type LanguageCode, type TravelType, type Trip } from "../models";
import { startLoading, stopLoading } from "./loaderStore";
import { disconnectSocket } from "./websocketStore";
import { clearAllMessages } from "./messagesStore";
import { clearAllTrips } from "./tripStore";
import { getNeonApp } from "./configStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  city?: string;
  country?: string;
  age?: number;
  languages: any[];
  travelTypes: string[];
  description?: string;
  budgetLevel?: number;
  profilePictureUrl?: string;
  tripsCount?:number;
  isVerified: boolean;
  isDeleted?: boolean;
  isAdmin?: boolean;
  reportedCount?: number;
  isBanned?: boolean;
  bannedAt?: string;
  bannedUntil?: string;
  bannedReason?: string;
  createdAt?: string;
}

interface RegisterInfos {
  id: string;
  email: string;
  password: string;
  pseudo: string;
  languages: LanguageCode[];
  budgetLevel: BudgetLevel;
  travelTypes: TravelType[];
  canRegister: boolean;
}

interface UserStore {
  isConnected: boolean;
  profile: UserProfile | null;
  trips: Trip[];
  registerInfos: RegisterInfos;
  isDropdownOpen: boolean;
  email:string;
  isFromBubble: boolean;
}

const [user, setUser] = createStore<UserStore>({
    isConnected: false,
    profile: null,
    trips: [],
    registerInfos: {
        id: "",
        email: "",
        password: "",
        pseudo: "",
        languages:[],
        budgetLevel:BUDGET_LEVELS.ECONOMIQUE,
        travelTypes: [],
        canRegister: false,
    },
    isDropdownOpen: false,
    email: "",
    isFromBubble: false,
});

const getUserFromDatabase = async (id: string) => {
    try {
        const response = await fetch(backendUrl + `/users/${id}`);
        
        if (response.status === 200) {
            const userData = await response.json();
            return { success: true, data: userData };
        } else {
            return { success: false, error: "Utilisateur non trouvé" };
        }
    } catch (error) {
        console.error("Impossible de récupérer l'utilisateur : ", error);
        return { success: false, error: "Impossible de communiquer avec le backend" };
    }
}

const getUserFromDatabaseWithEmail = async (email: string) => {
    try {
        const response = await fetch(backendUrl + `/users/by-email/${email}`);

        if (response.status === 200) {
            const userData = await response.json();
            return { success: true, data: userData };
        } else if (response.status === 404) {
            return { success: false, error: "Utilisateur non trouvé", data: null };
        } else {
            return { success: false, error: "Erreur serveur", data: null };
        }
    } catch (error) {
        console.error("Impossible de récupérer l'utilisateur : ", error);
        return { success: false, error: "Impossible de communiquer avec le backend", data: null };
    }
}

const getUserTripsFromDatabase = async (id: string) => {
    try {
        const response = await fetch(backendUrl + `/trips/organizer/${id}`);
        
        if (response.status === 200) {
            const tripsData = await response.json();
            return { success: true, data: tripsData };
        } else {
            return { success: false, error: "Aucun voyage trouvé" };
        }
    } catch (error) {
        console.error("Impossible de récupérer les voyages : ", error);
        return { success: false, error: "Impossible de communiquer avec le backend" };
    }
}

const getUserMemberTripsFromDatabase = async (id: string) => {
    try {
        const response = await fetch(backendUrl + `/trips/member/${id}`);
        
        if (response.status === 200) {
            const tripsData = await response.json();
            return { success: true, data: tripsData };
        } else {
            return { success: false, error: "Aucun voyage trouvé" };
        }
    } catch (error) {
        console.error("Impossible de récupérer les voyages : ", error);
        return { success: false, error: "Impossible de communiquer avec le backend" };
    }
}

const updateUserInDatabase = async (id: string, userData: {
    languages?: LanguageCode[];
    budgetLevel?: BudgetLevel;
    travelTypes?: string[];
    description?: string;
    city?: string;
    age?: number;
    country?: string;
    profilePictureUrl?: string;
    id?: string;

}) => {
    try {
        const response = await fetch(backendUrl + `/users/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });
        
        if (response.status === 200) {
            const updatedUser = await response.json();
            return { success: true, data: updatedUser };
        } else {
            return { success: false, error: "Erreur lors de la mise à jour de l'utilisateur" };
        }
    } catch (error) {
        console.error("Impossible de mettre à jour l'utilisateur : ", error);
        return { success: false, error: "Impossible de communiquer avec le backend" };
    }
}

const updateProfile = async (updateData: {
    languages?: LanguageCode[];
    budgetLevel?: BudgetLevel;
    travelTypes?: string[];
    description?: string;
    city?: string;
    country?: string;
    profilePictureUrl?: string;
    username?: string;
    age?: number;
    id?: string;
    email?: string;
}) => {
    if (!user.profile?.id) {
        return { success: false, error: "Aucun profil utilisateur" };
    }
            
    startLoading();
    
    
    const result = await updateUserInDatabase(user.profile.id, updateData);
    
    if (result.success) {
        const updatedUserResult = await getUserFromDatabase(user.profile.id);
        
        if (updatedUserResult.success && updatedUserResult.data) {    
            setUser("profile", updatedUserResult.data);
        }
        
        stopLoading();
        return { success: true };
    } else {
        stopLoading();
        return { success: false, error: result.error };
    }
};

const updateProfilePicture = async (url: string) => {
    if (!user.profile?.id) {
        return { success: false, error: "Aucun profil utilisateur" };
    }
    
    return await updateProfile({ profilePictureUrl: url });
};

const deleteProfilePicture = async () => {
    if (!user.profile?.id) {
        return { success: false, error: "Aucun profil utilisateur" };
    }
    
    const currentUrl = user.profile.profilePictureUrl;
    
    if (currentUrl) {
        try {
            await fetch(`${backendUrl}/api/uploadthing`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: currentUrl })
            });
        } catch (error) {
            console.error("Erreur lors de la suppression sur UploadThing:", error);
        }
    }
    
    return await updateProfile({ profilePictureUrl: "" });
};

const login = () => {
    setUser("isConnected", true);
}

const logout = () => {
    
    disconnectSocket();
    clearAllMessages();
    clearAllTrips();
    
    setUser({
        isConnected: false,
        profile: null,
        trips: [],
        registerInfos: {
            id: "",
            email: "",
            password: "",
            pseudo: "",
            languages: [],
            budgetLevel: BUDGET_LEVELS.ECONOMIQUE,
            travelTypes: [],
            canRegister: false,
        },
        isDropdownOpen: false
    });

}

const toggleDropdown = () => {
    setUser("isDropdownOpen", !user.isDropdownOpen);
}

const closeDropdown = () => {
    setUser("isDropdownOpen", false);
}

const setRegisterEmail = (email: string) => {
    setUser("registerInfos", "email", email);
}

const setRegisterPassword = (password: string) => {
    setUser("registerInfos", "password", password);
}

const setRegisterPseudo = (pseudo: string) => {
    setUser("registerInfos", "pseudo", pseudo);
}

const setRegisterLanguages = (languages: LanguageCode[]) => {
    setUser("registerInfos", "languages", languages);
}

const setRegisterBudgetLevel = (budgetLevel: BudgetLevel) => {
    const validLevels = Object.values(BUDGET_LEVELS);
    if (validLevels.includes(budgetLevel)) {
        setUser("registerInfos", "budgetLevel", budgetLevel);
    }
}

const setRegisterTravelTypes = (travelTypes: TravelType[]) => {
    setUser("registerInfos", "travelTypes", travelTypes);
}

const setCanRegister= (canRegister: boolean) => {
    setUser("registerInfos", "canRegister", canRegister);
}

const setRegisterUserId = (id: string) => {
    setUser("registerInfos", "id", id);
}

const setUserProfile = (profile: UserProfile | null) => {
    setUser("profile", profile);
}

const setUserTrips = (trips: Trip[]) => {
    setUser("trips", trips);
}

const getUserProfileById = async (id: string) => {
    try {
        const response = await fetch(backendUrl + `/users/${id}`);
        
        if (response.status === 200) {
            const userData = await response.json();
            return { success: true, data: userData };
        } else if (response.status === 404) {
            return { success: false, error: "Utilisateur non trouvé" };
        } else {
            return { success: false, error: "Erreur lors de la récupération de l'utilisateur" };
        }
    } catch (error) {
        console.error("Impossible de récupérer l'utilisateur : ", error);
        return { success: false, error: "Impossible de communiquer avec le backend" };
    }
}

const deleteAccount = async () => {
  if (!user.profile?.id) {
    return { success: false, error: "Aucun profil utilisateur" };
  }

  startLoading();

  try {
    const response = await fetch(`${backendUrl}/users/${user.profile.id}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      const neonApp = getNeonApp();
      // @ts-expect-error Stack Auth signOut exists but not in types
      await neonApp?.signOut();
      
      cleanupUserData();
      stopLoading();
      return { success: true };
    } else {
      stopLoading();
      return { success: false, error: "Erreur lors de la suppression du compte" };
    }
  } catch (error) {
    console.error("Impossible de supprimer le compte : ", error);
    stopLoading();
    return { success: false, error: "Impossible de communiquer avec le backend" };
  }
};

const cleanupUserData = () => {
    setUserProfile(null);
    setUserTrips([]);
    logout();
};

export {
    user,
    setUserProfile,
    setUserTrips,
    setRegisterUserId,
    setRegisterEmail,
    setRegisterPassword,
    setRegisterPseudo,
    setRegisterLanguages,
    setRegisterBudgetLevel,
    setRegisterTravelTypes,
    getUserMemberTripsFromDatabase,
    getUserFromDatabaseWithEmail,
    updateUserInDatabase,
    login,
    logout,
    toggleDropdown,
    closeDropdown,
    setCanRegister,
    getUserFromDatabase,
    getUserTripsFromDatabase,
    updateProfile,
    updateProfilePicture,
    deleteProfilePicture,
    getUserProfileById,
    deleteAccount,
    cleanupUserData
}