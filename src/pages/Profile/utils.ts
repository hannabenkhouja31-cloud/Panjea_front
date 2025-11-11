import type { LanguageCode } from "../../models";

export const capitalizeFirst = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getLocation = (city?: string, country?: string) => {
    const parts = [];
    if (city) parts.push(city);
    if (country) parts.push(country);
    return parts.length > 0 ? parts.join(", ") : "Non renseigné";
};

export const LANGUAGE_TO_FLAG: Record<LanguageCode, string> = {
    fr: 'fr',
    en: 'gb',
    es: 'es',
    de: 'de',
    it: 'it',
    pt: 'pt',
    nl: 'nl',
    pl: 'pl',
    ru: 'ru',
    ja: 'jp',
    zh: 'cn',
    ar: 'sa',
    hi: 'in',
    tr: 'tr',
    ko: 'kr'
};

export const BUDGET_SYMBOLS = {
    1: "€",
    2: "€€",
    3: "€€€"
};

export const BUDGET_LABELS = {
    1: "0-1250€",
    2: "1250-2500€",
    3: ">2500€"
};

export const formatDateRange = (monthYear: any) => {
    if (typeof monthYear === 'string') {
        const match = monthYear.match(/\[(\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})\)/);
        if (match) {
            const startDate = new Date(match[1]);
            const endDate = new Date(match[2]);
            const startMonth = startDate.toLocaleDateString('fr-FR', { month: 'short' });
            const endMonth = endDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            
            if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
                return endMonth;
            }
            return `${startMonth} - ${endMonth}`;
        }
    }
    return "Date à définir";
};

export const formatBudget = (budget?: number) => {
    if (!budget) return "Budget libre";
    return `${budget.toLocaleString('fr-FR')}€`;
};

export const getFirstTripImage = (tripItem: any) => {
    if (tripItem.media && tripItem.media.length > 0) {
        return tripItem.media[0].url;
    }
    return "/images/citiesBeautiful.png";
};