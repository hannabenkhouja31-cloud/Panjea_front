import { StackClientApp } from "@stackframe/js";
import { createStore } from "solid-js/store";
import type { TravelType } from "../models";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

let neonApp: StackClientApp | undefined;

interface BackendStore {
  isConnected: boolean;
  isNeonReady: boolean;
  travelTypes: Array<{id: number, slug: string, label: string}> | null;
}

const [backend, setBackend] = createStore<BackendStore>({
    isConnected: false,
    isNeonReady: false,
    travelTypes: null
});

const pingBackend = async () => {

    try {
        const response = await fetch(backendUrl);
        if(response.status === 200) {
            setBackend("isConnected", true);
        } else {
            setBackend("isConnected", false);
        }
    } catch(error) {
        setBackend("isConnected", false);
        console.error("Impossible de communiquer avec le backend : ",error);
    }

}

const getTravelTypes = async () => {

    try {
        const response = await fetch(backendUrl+"/travel-types");
        if(response.status === 200) {
            const travelTypesData = await response.json();
            setBackend("travelTypes", travelTypesData);
        } else {
            setBackend("travelTypes", null);
            setBackend("isConnected", false);
        }
    } catch(error) {
        setBackend("travelTypes", null);
        console.error("Impossible de communiquer avec le backend : ",error);
    }

}

const startNeonAuth = async () => {

    const stackClientApp = new StackClientApp({
        tokenStore: 'cookie',
        projectId: import.meta.env.VITE_STACK_PROJECT_ID,
        publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
        urls: {
            oauthCallback: '/',
        },
    });

    const project = await stackClientApp.getProject()

    if(project.displayName === 'Panjea') {
        neonApp = stackClientApp;
        setBackend("isNeonReady", true);
    } else {
        console.error('Il y a eu un problème lors de la connexion à NeonAuth');
        setBackend('isConnected',false)
    }

}


const createUserInDatabase = async (userData: {
    id: string;
    username: string;
    languages: string[];
    budgetLevel: number;
    travelTypes: TravelType[];
}) => {
    try {
        const response = await fetch(backendUrl + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });
        
        if (response.status === 201) {
            return { success: true };
        } else {
            return { success: false, error: "Erreur lors de la création de l'utilisateur" };
        }
    } catch (error) {
        console.error("Impossible de créer l'utilisateur : ", error);
        return { success: false, error: "Impossible de communiquer avec le backend" };
    }
}

const getNeonApp = () => neonApp;

export {
    backend,
    pingBackend,
    startNeonAuth,
    getNeonApp,
    getTravelTypes,
    createUserInDatabase,
}