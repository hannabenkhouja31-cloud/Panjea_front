import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { MapPin, Calendar, Users, Wallet } from "lucide-solid";
import { backend } from "../../stores/configStore";
import type { Trip } from "../../models";

interface ProfileTripsProps {
    trips: Trip[];
}

export const ProfileTrips = (props: ProfileTripsProps) => {
    const formatDateRange = (monthYear: any) => {
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

    const formatBudget = (budget?: number) => {
        if (!budget) return "Budget libre";
        return `${budget.toLocaleString('fr-FR')}€`;
    };

    const getTravelTypeLabel = (slug: string) => {
        const travelType = backend.travelTypes?.find((tt: any) => tt.slug === slug);
        return travelType?.label || slug;
    };

    const getFirstTripImage = (tripItem: any) => {
        if (tripItem.media && tripItem.media.length > 0) {
            return tripItem.media[0].url;
        }
        return "/images/citiesBeautiful.png";
    };

    return (
        <Show
            when={props.trips.length > 0}
            fallback={
                <div class="text-center py-12">
                    <svg class="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Aucun voyage pour le moment</h3>
                    <p class="text-gray-500">Les voyages apparaîtront ici</p>
                </div>
            }
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <For each={props.trips}>
                    {(tripItem) => (
                        <A 
                            href={`/voyage/${tripItem.id}`} 
                            class="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        >
                            <div class="relative h-52 overflow-hidden">
                                <img 
                                    src={getFirstTripImage(tripItem)}
                                    alt={tripItem.title} 
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                
                                <div class="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                                    <div class="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <Calendar size={14} class="text-color-main" />
                                        <span class="text-xs font-semibold text-color-dark">{formatDateRange(tripItem.monthYear)}</span>
                                    </div>
                                    <div class="bg-color-secondary/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                        <span class="text-xs font-bold text-white">
                                            {tripItem.minDays === tripItem.maxDays 
                                                ? `${tripItem.minDays}j` 
                                                : `${tripItem.minDays}-${tripItem.maxDays}j`}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="absolute bottom-4 left-4 right-4">
                                    <div class="flex items-start gap-2 mb-2">
                                        <MapPin size={18} class="text-white flex-shrink-0 mt-0.5" />
                                        <span class="text-sm font-medium text-white/90">{tripItem.destinationCountry}</span>
                                    </div>
                                    <h3 class="text-xl font-bold text-white drop-shadow-lg line-clamp-2 truncate">{tripItem.title}</h3>
                                </div>
                            </div>

                            <div class="p-5">
                                <div class="space-y-3 mb-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <Wallet size={18} class="text-color-secondary" />
                                            <span class="text-sm text-gray-600">Budget</span>
                                        </div>
                                        <span class="text-base font-bold text-color-main">{formatBudget(tripItem.budgetEur)}</span>
                                    </div>

                                    <Show when={tripItem.minAge || tripItem.maxAge}>
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-2">
                                                <Users size={18} class="text-color-main" />
                                                <span class="text-sm text-gray-600">Âges</span>
                                            </div>
                                            <span class="text-sm font-semibold text-color-dark">
                                                {tripItem.minAge && tripItem.maxAge 
                                                    ? `${tripItem.minAge}-${tripItem.maxAge} ans`
                                                    : tripItem.minAge 
                                                    ? `${tripItem.minAge}+ ans`
                                                    : `${tripItem.maxAge} ans max`}
                                            </span>
                                        </div>
                                    </Show>
                                </div>

                                <Show when={(tripItem as any).travelTypes?.length > 0}>
                                    <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                                        <For each={(tripItem as any).travelTypes?.slice(0, 3)}>
                                            {(slug: string) => (
                                                <span class="px-3 py-1 bg-color-light text-color-main text-xs rounded-full font-medium">
                                                    {getTravelTypeLabel(slug)}
                                                </span>
                                            )}
                                        </For>
                                        <Show when={(tripItem as any).travelTypes?.length > 3}>
                                            <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                                +{(tripItem as any).travelTypes.length - 3}
                                            </span>
                                        </Show>
                                    </div>
                                </Show>
                            </div>
                        </A>
                    )}
                </For>
            </div>
        </Show>
    );
};