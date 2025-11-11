import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { For, Show, onMount, onCleanup, createSignal, createEffect } from "solid-js";
import { Plus, MapPin, Calendar, Users, Wallet } from "lucide-solid";
import { trip, getAllTrips } from "../../stores/tripStore";
import { backend } from "../../stores/configStore";
import { user } from "../../stores/userStore";

export const VoyagePage = () => {
    const navigate = useNavigate();
    
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoadingMore, setIsLoadingMore] = createSignal(false);
    const [isInitialLoading, setIsInitialLoading] = createSignal(true);
    const [sentinelRef, setSentinelRef] = createSignal<HTMLDivElement>();

    onMount(async () => {
        const shouldRefresh = searchParams.refresh === 'true';
        
        if (trip.trips.length === 0 || !trip.tripsMeta || shouldRefresh) {
            await getAllTrips(1, false);
            
            if (shouldRefresh) {
                setSearchParams({ refresh: undefined });
            }
        }
        setIsInitialLoading(false);
    });

    createEffect(() => {
        const el = sentinelRef();
        if (!el) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && trip.tripsMeta?.hasNextPage && !isLoadingMore()) {
                    setIsLoadingMore(true);
                    await getAllTrips(trip.tripsMeta.page + 1, true);
                    setIsLoadingMore(false);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);

        onCleanup(() => {
            observer.unobserve(el);
        });
    });

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
    <div class="container-app pb-16 pt-24 flex-1 w-full min-h-screen relative bg-color-light">
        <div class="flex items-center gap-4 mb-4">
            <h1 class="text-3xl text-color-dark font-bold">Tous les voyages</h1>
            <button 
                onClick={() => navigate("/voyage/creer")}
                class="flex items-center relative top-[2px] gap-1 text-color-secondary hover:text-color-main transition-colors cursor-pointer" 
            >
                <Plus size={20} />
                <span class="text-base font-medium">Créer</span>
            </button>
        </div>
        <h2 class="mt-4 text-color-dark opacity-50">
            Explore l'ensemble des voyages proposés par nos membres. Filtre selon tes préférences pour trouver ta prochaine aventure
        </h2>
        <div class="mt-8 bg-white rounded-xl w-full h-16 flex justify-center items-center">
            <h1 class="text-color-dark opacity-70">Filtres et recherches</h1>
        </div>

        <Show
            when={!isInitialLoading()}
            fallback={
                <div class="w-full mt-16 flex flex-col items-center justify-center gap-4">
                    <span class="loading loading-spinner loading-xl text-color-main"></span>
                    <p class="text-xl text-gray-500">Chargement des voyages...</p>
                </div>
            }
        >
            <Show
                when={trip.trips.length > 0}
                fallback={
                    <div class="w-full mt-16 flex flex-col items-center justify-center gap-4">
                        <MapPin size={48} class="text-color-main opacity-30" />
                        <p class="text-xl text-color-main opacity-50 font-medium">Aucun voyage disponible</p>
                    </div>
                }
            >
                <div class="w-full mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    <For each={trip.trips}>
                        {(tripItem) => (
                            <A 
                                href={`/voyage/${tripItem.id}`} 
                                class={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                                    isUserTrip((tripItem as any).organizerId) ? 'border-4 border-color-main' : ''
                                }`}
                            >
                                <div class="relative h-52 overflow-hidden">
                                    <img 
                                        src={getFirstTripImage(tripItem)}
                                        alt={tripItem.title} 
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                    
                                    <div class="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                                        <div class="flex items-center gap-2">
                                            <div class="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                                                <Calendar size={14} class="text-color-main" />
                                                <span class="text-xs font-semibold text-color-dark">{formatDateRange(tripItem.monthYear)}</span>
                                            </div>
                                            <Show when={isUserTrip((tripItem as any).organizerId)}>
                                                <div class="bg-color-main/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                                    <span class="text-xs font-bold text-white">Mon voyage</span>
                                                </div>
                                            </Show>
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

                    <div ref={setSentinelRef} class="w-full h-20 flex items-center justify-center">
                        <Show when={isLoadingMore()}>
                            <span class="loading loading-spinner loading-lg text-color-main"></span>
                        </Show>
                        <Show when={!trip.tripsMeta?.hasNextPage && !isLoadingMore()}>
                            <p class="text-gray-500 text-sm">Vous avez vu tous les voyages disponibles</p>
                        </Show>
                    </div>
                </Show>
            </Show>

            <button 
                onClick={() => navigate("/voyage/creer")}
                class="fixed bottom-8 right-8 w-16 h-16 bg-color-secondary text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center z-40 hover:shadow-color-secondary/50"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}

export default VoyagePage;