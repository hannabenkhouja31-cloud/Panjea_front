import { Show, type Accessor, type Setter } from "solid-js";
import { MapPin, Calendar, Clock } from "lucide-solid";
import { formatDateRange } from "./utils";

interface TripHeaderProps {
    trip: any;
    isUserTrip: boolean;
    isEditing: boolean;
    editTitle: Accessor<string>;
    setEditTitle: Setter<string>;
    editStartDate: Accessor<string>;
    editEndDate: Accessor<string>;
    editMinDays: Accessor<number>;
    setEditMinDays: Setter<number>;
    editMaxDays: Accessor<number>;
    setEditMaxDays: Setter<number>;
    startDateInput: HTMLInputElement | undefined;
    endDateInput: HTMLInputElement | undefined;
}

export const TripHeader = (props: TripHeaderProps) => {
    return (
        <div>
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Show when={!props.isEditing} fallback={
                    <input
                        type="text"
                        value={props.editTitle()}
                        onInput={(e) => props.setEditTitle(e.target.value)}
                        class="flex-1 text-xl sm:text-3xl font-bold text-color-dark px-3 py-2 sm:px-4 border-2 border-color-main rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main bg-white"
                        placeholder="Titre du voyage"
                    />
                }>
                    <h1 class="text-2xl sm:text-3xl font-bold text-color-dark break-words">
                        {props.trip?.title}
                    </h1>
                </Show>
                <Show when={props.isUserTrip && !props.isEditing}>
                    <div class="bg-color-main px-3 py-1.5 sm:px-4 sm:py-2 rounded-full self-start flex-shrink-0">
                        <span class="text-xs sm:text-sm font-bold text-white">Mon voyage</span>
                    </div>
                </Show>
            </div>
            <div class="flex flex-wrap gap-2 sm:gap-4">
                <div class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-color-dark text-sm sm:text-base">
                    <MapPin size={16} class="sm:w-[18px] sm:h-[18px] text-color-main" />
                    <span class="font-medium">{props.trip?.destinationCountry}</span>
                </div>
                <Show when={!props.isEditing} fallback={
                    <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <input
                            ref={props.startDateInput}
                            type="text"
                            placeholder="Date début"
                            readonly
                            class="px-3 py-2 sm:px-4 sm:py-3 border-2 border-color-main rounded-xl bg-white text-color-dark cursor-pointer text-sm sm:text-base w-full sm:w-auto"
                        />
                        <input
                            ref={props.endDateInput}
                            type="text"
                            placeholder="Date fin"
                            readonly
                            class="px-3 py-2 sm:px-4 sm:py-3 border-2 border-color-main rounded-xl bg-white text-color-dark cursor-pointer text-sm sm:text-base w-full sm:w-auto"
                        />
                    </div>
                }>
                    <div class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-color-dark text-sm sm:text-base">
                        <Calendar size={16} class="sm:w-[18px] sm:h-[18px] text-color-main" />
                        <span class="font-medium">{formatDateRange(props.trip?.monthYear)}</span>
                    </div>
                </Show>
                <Show when={!props.isEditing} fallback={
                    <div class="flex gap-2 items-center w-full sm:w-auto">
                        <input
                            type="number"
                            value={props.editMinDays()}
                            onInput={(e) => props.setEditMinDays(Number(e.target.value))}
                            class="w-16 sm:w-20 px-2 py-2 sm:px-3 sm:py-3 border-2 border-color-main rounded-xl bg-white text-color-dark text-sm sm:text-base"
                            min="1"
                        />
                        <span class="text-color-dark text-sm">-</span>
                        <input
                            type="number"
                            value={props.editMaxDays()}
                            onInput={(e) => props.setEditMaxDays(Number(e.target.value))}
                            class="w-16 sm:w-20 px-2 py-2 sm:px-3 sm:py-3 border-2 border-color-main rounded-xl bg-white text-color-dark text-sm sm:text-base"
                            min={props.editMinDays()}
                        />
                        <span class="text-color-dark text-sm sm:text-base">jours</span>
                    </div>
                }>
                    <div class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-color-dark text-sm sm:text-base">
                        <Clock size={16} class="sm:w-[18px] sm:h-[18px] text-color-main" />
                        <span class="font-medium">
                            {props.trip?.minDays === props.trip?.maxDays
                                ? `${props.trip?.minDays} jours`
                                : `${props.trip?.minDays}-${props.trip?.maxDays} jours`}
                        </span>
                    </div>
                </Show>
            </div>
        </div>
    );
};