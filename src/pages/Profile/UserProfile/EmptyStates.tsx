import { useNavigate } from "@solidjs/router";

export const UserNotFound = () => {
    const navigate = useNavigate();
    
    return (
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
    );
};

export const UserDeleted = () => {
    const navigate = useNavigate();
    
    return (
        <div class="container-app py-12">
            <div class="bg-white rounded-2xl shadow-sm p-12 text-center">
                <svg class="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
                <h2 class="text-2xl font-bold text-gray-700 mb-2">Utilisateur supprimé</h2>
                <p class="text-gray-500 mb-6">Ce compte a été supprimé par son propriétaire</p>
                <button 
                    onClick={() => navigate("/voyage")}
                    class="bg-color-main text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200"
                >
                    Retour aux voyages
                </button>
            </div>
        </div>
    );
};
