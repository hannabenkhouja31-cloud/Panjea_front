import { For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { MapPin, Calendar, Users, Wallet } from "lucide-solid";
import { backend } from "../../../stores/configStore";
import { user } from "../../../stores/userStore";


interface TripCardProps {
    trip: any;
}

export const TripCard = (props: TripCardProps) => {
    const getFirstTripImage = (tripItem: any) => {
        if (tripItem.media && tripItem.media.length > 0) {
            return tripItem.media[0].url;
        }
        return "/images/citiesBeautiful.png";
    };

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

    const isUserTrip = (organizerId: string) => {
        return user.profile?.id === organizerId;
    };

    return (
        <A 
            href={`/voyage/${props.trip.id}`} 
            class={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                isUserTrip(props.trip.organizerId) ? 'border-4 border-color-main' : ''
            }`}
        >
            <div class="relative h-52 overflow-hidden">
                <img 
                    src={getFirstTripImage(props.trip)}
                    alt={props.trip.title} 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                <div class="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <div class="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                            <Calendar size={14} class="text-color-main" />
                            <span class="text-xs font-semibold text-color-dark">{formatDateRange(props.trip.monthYear)}</span>
                        </div>
                        <Show when={isUserTrip(props.trip.organizerId)}>
                            <div class="bg-color-main/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <span class="text-xs font-bold text-white">Mon voyage</span>
                            </div>
                        </Show>
                    </div>
                    <div class="bg-color-secondary/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span class="text-xs font-bold text-white">
                            {props.trip.minDays === props.trip.maxDays 
                                ? `${props.trip.minDays}j` 
                                : `${props.trip.minDays}-${props.trip.maxDays}j`}
                        </span>
                    </div>
                </div>
                
                <div class="absolute bottom-4 left-4 right-4">
                    <div class="flex items-start gap-2 mb-2">
                        <MapPin size={18} class="text-white flex-shrink-0 mt-0.5" />
                        <span class="text-sm font-medium text-white/90">{props.trip.destinationCountry}</span>
                    </div>
                    <h3 class="text-xl font-bold text-white drop-shadow-lg line-clamp-2 truncate">{props.trip.title}</h3>
                </div>
            </div>

            <div class="p-5">
                <div class="space-y-3 mb-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Wallet size={18} class="text-color-secondary" />
                            <span class="text-sm text-gray-600">Budget</span>
                        </div>
                        <span class="text-base font-bold text-color-main">{formatBudget(props.trip.budgetEur)}</span>
                    </div>

                    <Show when={props.trip.minAge || props.trip.maxAge}>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <Users size={18} class="text-color-main" />
                                <span class="text-sm text-gray-600">Âges</span>
                            </div>
                            <span class="text-sm font-semibold text-color-dark">
                                {props.trip.minAge && props.trip.maxAge 
                                    ? `${props.trip.minAge}-${props.trip.maxAge} ans`
                                    : props.trip.minAge 
                                    ? `${props.trip.minAge}+ ans`
                                    : `${props.trip.maxAge} ans max`}
                            </span>
                        </div>
                    </Show>
                </div>

                <Show when={props.trip.travelTypes?.length > 0}>
                    <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        <For each={props.trip.travelTypes?.slice(0, 3)}>
                            {(slug: string) => (
                                <span class="px-3 py-1 bg-color-light text-color-main text-xs rounded-full font-medium">
                                    {getTravelTypeLabel(slug)}
                                </span>
                            )}
                        </For>
                        <Show when={props.trip.travelTypes?.length > 3}>
                            <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                +{props.trip.travelTypes.length - 3}
                            </span>
                        </Show>
                    </div>
                </Show>
            </div>
        </A>
    );
};