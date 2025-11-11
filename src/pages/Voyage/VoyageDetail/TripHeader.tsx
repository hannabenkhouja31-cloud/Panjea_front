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
            <div class="flex items-start justify-between gap-4 mb-4">
                <Show when={!props.isEditing} fallback={
                    <input
                        type="text"
                        value={props.editTitle()}
                        onInput={(e) => props.setEditTitle(e.target.value)}
                        class="flex-1 text-3xl font-bold text-color-dark px-4 py-2 border-2 border-color-main rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main bg-white"
                        placeholder="Titre du voyage"
                    />
                }>
                    <h1 class="text-3xl font-bold text-color-dark truncate">
                        {props.trip?.title}
                    </h1>
                </Show>
                <Show when={props.isUserTrip && !props.isEditing}>
                    <div class="bg-color-main px-4 py-2 rounded-full flex-shrink-0">
                        <span class="text-sm font-bold text-white">Mon voyage</span>
                    </div>
                </Show>
            </div>
            <div class="flex flex-wrap gap-4">
                <div class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-color-dark">
                    <MapPin size={18} class="text-color-main" />
                    <span class="font-medium">{props.trip?.destinationCountry}</span>
                </div>
                <Show when={!props.isEditing} fallback={
                    <div class="flex gap-2">
                        <input
                            ref={props.startDateInput}
                            type="text"
                            placeholder="Date début"
                            readonly
                            class="px-4 py-3 border-2 border-color-main rounded-xl bg-white text-color-dark cursor-pointer"
                        />
                        <input
                            ref={props.endDateInput}
                            type="text"
                            placeholder="Date fin"
                            readonly
                            class="px-4 py-3 border-2 border-color-main rounded-xl bg-white text-color-dark cursor-pointer"
                        />
                    </div>
                }>
                    <div class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-color-dark">
                        <Calendar size={18} class="text-color-main" />
                        <span class="font-medium">{formatDateRange(props.trip?.monthYear)}</span>
                    </div>
                </Show>
                <Show when={!props.isEditing} fallback={
                    <div class="flex gap-2 items-center">
                        <input
                            type="number"
                            value={props.editMinDays()}
                            onInput={(e) => props.setEditMinDays(Number(e.target.value))}
                            class="w-20 px-3 py-3 border-2 border-color-main rounded-xl bg-white text-color-dark"
                            min="1"
                        />
                        <span class="text-color-dark">-</span>
                        <input
                            type="number"
                            value={props.editMaxDays()}
                            onInput={(e) => props.setEditMaxDays(Number(e.target.value))}
                            class="w-20 px-3 py-3 border-2 border-color-main rounded-xl bg-white text-color-dark"
                            min={props.editMinDays()}
                        />
                        <span class="text-color-dark">jours</span>
                    </div>
                }>
                    <div class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-color-dark">
                        <Clock size={18} class="text-color-main" />
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