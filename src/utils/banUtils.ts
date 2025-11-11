const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const checkUserBanStatus = async (userId: string) => {
    try {
        const response = await fetch(`${backendUrl}/users/${userId}`);
        
        if (response.ok) {
            const userData = await response.json();
            
            if (userData.isBanned && userData.bannedUntil) {
                const banEndDate = new Date(userData.bannedUntil);
                const now = new Date();
                
                if (now > banEndDate) {
                    await fetch(`${backendUrl}/admin/check-expired-bans`, {
                        method: 'POST',
                    });
                    
                    return { isBanned: false, wasAutoUnbanned: true };
                }
            }
            
            return { 
                isBanned: userData.isBanned, 
                bannedReason: userData.bannedReason,
                bannedUntil: userData.bannedUntil,
                wasAutoUnbanned: false 
            };
        }
        
        return { isBanned: false, wasAutoUnbanned: false };
    } catch (error) {
        console.error("Erreur lors de la vérification du ban:", error);
        return { isBanned: false, wasAutoUnbanned: false };
    }
};