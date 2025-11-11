export const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
        spam: "Spam ou publicité",
        harassment: "Harcèlement",
        inappropriate: "Contenu inapproprié",
        fake: "Faux profil",
        scam: "Arnaque",
        other: "Autre",
    };
    return reasons[reason] || reason;
};

export const formatBanDuration = (bannedAt?: string, bannedUntil?: string) => {
    if (!bannedAt) return null;
    if (!bannedUntil) return "Permanent";
    
    const end = new Date(bannedUntil);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return "Expiré";
    return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
};