import { useNavigate, useSearchParams } from "@solidjs/router";
import { For, Show, onMount, onCleanup, createSignal, createEffect, createMemo } from "solid-js";
import { Plus, MapPin } from "lucide-solid";
import { FilterBar } from "./FilterBar";
import { TripCard } from "./TripCard";
import { getAllTrips, trip } from "../../../stores/tripStore";

export const VoyagePage = () => {
    const navigate = useNavigate();
    
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoadingMore, setIsLoadingMore] = createSignal(false);
    const [isInitialLoading, setIsInitialLoading] = createSignal(true);
    const [sentinelRef, setSentinelRef] = createSignal<HTMLDivElement>();
    
    const [selectedCountry, setSelectedCountry] = createSignal("");
    const [selectedTravelTypes, setSelectedTravelTypes] = createSignal<string[]>([]);
    const [budgetRange, setBudgetRange] = createSignal<[number, number]>([0, 10000]);
    const [durationRange, setDurationRange] = createSignal<[number, number]>([1, 30]);
    const [ageRange, setAgeRange] = createSignal<[number, number]>([18, 99]);

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

    const uniqueCountries = createMemo(() => {
        const countries = trip.trips.map(t => t.destinationCountry);
        return [...new Set(countries)].sort();
    });

    const filteredTrips = createMemo(() => {
        return trip.trips.filter(tripItem => {
            const tripAny = tripItem as any;
            
            if (!tripAny.organizerId || tripAny.organizerIsDeleted || tripAny.organizerIsBanned) {
                return false;
            }
            
            if (selectedCountry() && tripItem.destinationCountry !== selectedCountry()) {
                return false;
            }

            if (selectedTravelTypes().length > 0) {
                const tripTypes = tripAny.travelTypes || [];
                const hasMatchingType = selectedTravelTypes().some(type => tripTypes.includes(type));
                if (!hasMatchingType) return false;
            }

            if (tripItem.budgetEur) {
                if (tripItem.budgetEur < budgetRange()[0] || tripItem.budgetEur > budgetRange()[1]) {
                    return false;
                }
            }

            const avgDays = (tripItem.minDays + tripItem.maxDays) / 2;
            if (avgDays < durationRange()[0] || avgDays > durationRange()[1]) {
                return false;
            }

            if (tripItem.minAge || tripItem.maxAge) {
                const tripMinAge = tripItem.minAge || 0;
                const tripMaxAge = tripItem.maxAge || 99;
                if (tripMaxAge < ageRange()[0] || tripMinAge > ageRange()[1]) {
                    return false;
                }
            }

            return true;
        });
    });

    const activeFiltersCount = createMemo(() => {
        let count = 0;
        if (selectedCountry()) count++;
        if (selectedTravelTypes().length > 0) count++;
        if (budgetRange()[0] > 0 || budgetRange()[1] < 10000) count++;
        if (durationRange()[0] > 1 || durationRange()[1] < 30) count++;
        if (ageRange()[0] > 18 || ageRange()[1] < 99) count++;
        return count;
    });

    const resetFilters = () => {
        setSelectedCountry("");
        setSelectedTravelTypes([]);
        setBudgetRange([0, 10000]);
        setDurationRange([1, 30]);
        setAgeRange([18, 99]);
    };

    return (
        <div class="container-app pb-16 pt-24 flex-1 w-full min-h-screen relative bg-color-light">
            <div class="flex items-center gap-4 mb-4">
                <h1 class="text-3xl text-color-dark font-bold">Tous les voyages</h1>
                <button 
                    onClick={() => navigate("/voyage/creer")}
                    class="group flex items-center relative top-[2px] gap-1 text-color-secondary hover:text-color-main hover:scale-110 transition-all duration-300 cursor-pointer" 
                >
                    <Plus size={20} class="group-hover:rotate-90 transition-transform duration-300" />
                    <span class="text-base font-medium">Créer</span>
                </button>
            </div>
            <h2 class="mt-4 text-color-dark opacity-50">
                Explore l'ensemble des voyages proposés par nos membres. Filtre selon tes préférences pour trouver ta prochaine aventure
            </h2>

            <FilterBar
                uniqueCountries={uniqueCountries}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                selectedTravelTypes={selectedTravelTypes}
                setSelectedTravelTypes={setSelectedTravelTypes}
                budgetRange={budgetRange}
                setBudgetRange={setBudgetRange}
                durationRange={durationRange}
                setDurationRange={setDurationRange}
                ageRange={ageRange}
                setAgeRange={setAgeRange}
                activeFiltersCount={activeFiltersCount}
                resetFilters={resetFilters}
                filteredTripsCount={filteredTrips().length}
            />

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
                    when={filteredTrips().length > 0}
                    fallback={
                        <div class="w-full mt-16 flex flex-col items-center justify-center gap-4">
                            <MapPin size={48} class="text-color-main opacity-30" />
                            <p class="text-xl text-color-main opacity-50 font-medium">Aucun voyage ne correspond à tes critères</p>
                            <Show when={activeFiltersCount() > 0}>
                                <button
                                    onClick={resetFilters}
                                    class="btn btn-outline border-color-main text-color-main hover:bg-color-main hover:text-white"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </Show>
                        </div>
                    }
                >
                    <div class="w-full mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                        <For each={filteredTrips()}>
                            {(tripItem) => <TripCard trip={tripItem} />}
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
                class="group fixed bottom-8 right-8 w-18 h-18 bg-color-secondary text-white rounded-full shadow-2xl hover:scale-110 hover:rotate-12 active:scale-95 transition-all duration-200 flex items-center justify-center z-40 hover:shadow-color-secondary/50 animate-pulse-attention"
            >
                <Plus size={32} class="group-hover:rotate-90 transition-transform duration-300" />
            </button>
        </div>
    );
}

export default VoyagePage;