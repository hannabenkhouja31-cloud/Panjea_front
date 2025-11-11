import { backend } from "../../../stores/configStore";

export const formatDateRange = (monthYear: any) => {
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

export const formatBudget = (budget?: number) => {
    if (!budget) return "Budget libre";
    return `${budget.toLocaleString('fr-FR')}€`;
};

export const getTravelTypeLabel = (slug: string) => {
    const travelType = backend.travelTypes?.find((tt: any) => tt.slug === slug);
    return travelType?.label || slug;
};