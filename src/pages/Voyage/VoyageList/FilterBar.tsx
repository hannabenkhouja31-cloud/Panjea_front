import { For, Show, createSignal, type Accessor, type Setter } from "solid-js";
import { Filter, ChevronDown, MapPin, Wallet, Calendar, Users, X } from "lucide-solid";
import { backend } from "../../../stores/configStore";

interface FilterBarProps {
    uniqueCountries: Accessor<string[]>;
    selectedCountry: Accessor<string>;
    setSelectedCountry: Setter<string>;
    selectedTravelTypes: Accessor<string[]>;
    setSelectedTravelTypes: Setter<string[]>;
    budgetRange: Accessor<[number, number]>;
    setBudgetRange: Setter<[number, number]>;
    durationRange: Accessor<[number, number]>;
    setDurationRange: Setter<[number, number]>;
    ageRange: Accessor<[number, number]>;
    setAgeRange: Setter<[number, number]>;
    activeFiltersCount: Accessor<number>;
    resetFilters: () => void;
    filteredTripsCount: number;
}

export const FilterBar = (props: FilterBarProps) => {
    const [showFilters, setShowFilters] = createSignal(false);

    const toggleTravelType = (slug: string) => {
        if (props.selectedTravelTypes().includes(slug)) {
            props.setSelectedTravelTypes(props.selectedTravelTypes().filter(t => t !== slug));
        } else {
            props.setSelectedTravelTypes([...props.selectedTravelTypes(), slug]);
        }
    };

    return (
        <div class="mt-8 bg-white rounded-xl w-full overflow-hidden border-[1px] border-gray-200">
            <div class="p-4 flex flex-col items-center sm:flex-row gap-3">
                <div class="flex-1">
                    <select
                        value={props.selectedCountry()}
                        onChange={(e) => props.setSelectedCountry(e.currentTarget.value)}
                        class="cursor-pointer select select-bordered w-full bg-white"
                    >
                        <option value="">Toutes les destinations</option>
                        <For each={props.uniqueCountries()}>
                            {(country) => <option value={country}>{country}</option>}
                        </For>
                    </select>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters())}
                    class="border cursor-pointer rounded-xl p-2 text-color-main flex items-center gap-2"
                >
                    <Filter size={18} />
                    <span>Filtres</span>
                    <Show when={props.activeFiltersCount() > 0}>
                        <span class="badge badge-sm bg-color-secondary text-white border-0">
                            {props.activeFiltersCount()}
                        </span>
                    </Show>
                    <ChevronDown 
                        size={16} 
                        class={`transition-transform ${showFilters() ? 'rotate-180' : ''}`} 
                    />
                </button>
            </div>

            <Show when={showFilters()}>
                <div class="border-t border-gray-100 p-4 space-y-6 animate-fade-in">
                    <div>
                        <label class="flex items-center gap-2 text-sm font-semibold text-color-dark mb-3">
                            <MapPin size={16} class="text-color-main" />
                            Types de voyage
                        </label>
                        <div class="flex flex-wrap gap-2">
                            <For each={backend.travelTypes}>
                                {(travelType: any) => (
                                    <button
                                        onClick={() => toggleTravelType(travelType.slug)}
                                        class={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            props.selectedTravelTypes().includes(travelType.slug)
                                                ? 'bg-color-main text-white'
                                                : 'bg-color-light text-color-main hover:bg-color-main hover:text-white'
                                        }`}
                                    >
                                        {travelType.label}
                                    </button>
                                )}
                            </For>
                        </div>
                    </div>

                    <div class="flex flex-row justify-between items-center ">
                        <div>
                            <label class="flex items-center gap-2 text-sm font-semibold text-color-dark mb-2">
                                <Wallet size={16} class="text-color-secondary" />
                                Budget (€)
                            </label>
                            <div class="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={props.budgetRange()[0]}
                                    onInput={(e) => props.setBudgetRange([parseInt(e.currentTarget.value) || 0, props.budgetRange()[1]])}
                                    class="input input-bordered w-24 bg-white"
                                    min="0"
                                />
                                <span class="text-gray-400">—</span>
                                <input
                                    type="number"
                                    value={props.budgetRange()[1]}
                                    onInput={(e) => props.setBudgetRange([props.budgetRange()[0], parseInt(e.currentTarget.value) || 10000])}
                                    class="input input-bordered w-24 bg-white"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label class="flex items-center gap-2 text-sm font-semibold text-color-dark mb-2">
                                <Calendar size={16} class="text-color-main" />
                                Durée (jours)
                            </label>
                            <div class="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={props.durationRange()[0]}
                                    onInput={(e) => props.setDurationRange([parseInt(e.currentTarget.value) || 1, props.durationRange()[1]])}
                                    class="input input-bordered w-24 bg-white"
                                    min="1"
                                />
                                <span class="text-gray-400">—</span>
                                <input
                                    type="number"
                                    value={props.durationRange()[1]}
                                    onInput={(e) => props.setDurationRange([props.durationRange()[0], parseInt(e.currentTarget.value) || 30])}
                                    class="input input-bordered w-24 bg-white"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div>
                            <label class="flex items-center gap-2 text-sm font-semibold text-color-dark mb-2">
                                <Users size={16} class="text-color-main" />
                                Âge
                            </label>
                            <div class="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={props.ageRange()[0]}
                                    onInput={(e) => props.setAgeRange([parseInt(e.currentTarget.value) || 18, props.ageRange()[1]])}
                                    class="input input-bordered w-24 bg-white"
                                    min="0"
                                />
                                <span class="text-gray-400">—</span>
                                <input
                                    type="number"
                                    value={props.ageRange()[1]}
                                    onInput={(e) => props.setAgeRange([props.ageRange()[0], parseInt(e.currentTarget.value) || 99])}
                                    class="input input-bordered w-24 bg-white"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <Show when={props.activeFiltersCount() > 0}>
                        <button
                            onClick={props.resetFilters}
                            class="btn btn-outline w-full border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                        >
                            <X size={18} />
                            Réinitialiser les filtres
                        </button>
                    </Show>
                </div>
            </Show>

            <div class="border-t border-gray-100 px-4 py-3 bg-gray-50">
                <p class="text-sm text-gray-600">
                    <span class="font-semibold text-color-main">{props.filteredTripsCount}</span> voyage{props.filteredTripsCount > 1 ? 's' : ''} trouvé{props.filteredTripsCount > 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
};