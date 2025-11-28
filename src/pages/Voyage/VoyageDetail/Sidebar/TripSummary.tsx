import { Show, type Accessor, type Setter } from "solid-js";
import { Calendar, Clock, Users } from "lucide-solid";
import { formatDateRange, formatBudget } from "../utils";

interface TripSummaryProps {
    trip: any;
    isEditing: boolean;
    editBudgetEur: Accessor<number | undefined>;
    setEditBudgetEur: Setter<number | undefined>;
    editMinAge: Accessor<number | undefined>;
    setEditMinAge: Setter<number | undefined>;
    editMaxAge: Accessor<number | undefined>;
    setEditMaxAge: Setter<number | undefined>;
}

export const TripSummary = (props: TripSummaryProps) => {
    return (
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-lg sticky top-20 z-10 p-4 sm:p-6">
            <div class="pb-3 sm:pb-4 border-b border-gray-200">
                <p class="text-color-dark text-xs sm:text-sm mb-2">Budget estimé</p>
                <Show when={!props.isEditing} fallback={
                    <input
                        type="number"
                        value={props.editBudgetEur() || ""}
                        onInput={(e) => props.setEditBudgetEur(e.target.value ? Number(e.target.value) : undefined)}
                        class="w-full text-2xl sm:text-3xl font-bold text-color-main px-3 py-2 border-2 border-color-main rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main bg-white"
                        placeholder="Budget"
                        min="0"
                    />
                }>
                    <p class="text-2xl sm:text-3xl font-bold text-color-main">
                        {formatBudget(props.trip?.budgetEur)}
                    </p>
                </Show>
                <Show when={props.trip?.budgetEur && !props.isEditing}>
                    <p class="text-xs sm:text-sm text-gray-500">par personne</p>
                </Show>
            </div>

            <div class="space-y-3 py-3 sm:py-4">
                <div class="flex justify-between text-sm sm:text-base">
                    <span class="text-color-dark flex items-center gap-2">
                        <Calendar size={16} class="text-color-secondary sm:w-[18px] sm:h-[18px]" />
                        Période
                    </span>
                    <span class="font-medium text-color-dark text-right">
                        {formatDateRange(props.trip?.monthYear)}
                    </span>
                </div>
                <div class="flex justify-between text-sm sm:text-base">
                    <span class="text-color-dark flex items-center gap-2">
                        <Clock size={16} class="text-color-secondary sm:w-[18px] sm:h-[18px]" />
                        Durée
                    </span>
                    <span class="font-medium text-color-dark">
                        {props.trip?.minDays === props.trip?.maxDays
                            ? `${props.trip?.minDays} jours`
                            : `${props.trip?.minDays}-${props.trip?.maxDays} jours`}
                    </span>
                </div>
                <Show when={props.trip?.minAge || props.trip?.maxAge || props.isEditing}>
                    <div class="flex justify-between text-sm sm:text-base items-center">
                        <span class="text-color-dark flex items-center gap-2">
                            <Users size={16} class="text-color-secondary sm:w-[18px] sm:h-[18px]" />
                            Âges
                        </span>
                        <Show when={!props.isEditing} fallback={
                            <div class="flex gap-1.5 sm:gap-2 items-center">
                                <input
                                    type="number"
                                    value={props.editMinAge() || ""}
                                    onInput={(e) => props.setEditMinAge(e.target.value ? Number(e.target.value) : undefined)}
                                    class="w-14 sm:w-16 px-1.5 py-1 border-2 border-color-main rounded-lg bg-white text-color-dark text-xs"
                                    placeholder="Min"
                                    min="18"
                                    max="99"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    value={props.editMaxAge() || ""}
                                    onInput={(e) => props.setEditMaxAge(e.target.value ? Number(e.target.value) : undefined)}
                                    class="w-14 sm:w-16 px-1.5 py-1 border-2 border-color-main rounded-lg bg-white text-color-dark text-xs"
                                    placeholder="Max"
                                    min="18"
                                    max="99"
                                />
                            </div>
                        }>
                            <span class="font-medium text-color-dark">
                                {props.trip?.minAge && props.trip?.maxAge
                                    ? `${props.trip?.minAge}-${props.trip?.maxAge} ans`
                                    : props.trip?.minAge
                                        ? `${props.trip?.minAge}+ ans`
                                        : `${props.trip?.maxAge} ans max`}
                            </span>
                        </Show>
                    </div>
                </Show>
            </div>
        </div>
    );
};