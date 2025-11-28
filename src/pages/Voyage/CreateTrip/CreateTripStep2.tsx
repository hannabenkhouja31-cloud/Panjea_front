import { createEffect, onMount } from "solid-js";
import { Calendar } from "lucide-solid";
import AirDatepicker from "air-datepicker";
import "air-datepicker/air-datepicker.css";
import localeFr from "air-datepicker/locale/fr";

interface CreateTripStep2Props {
    currentStep: number;
    startDate: string;
    endDate: string;
    minDays: number;
    maxDays: number;
    setStartDate: (value: string) => void;
    setEndDate: (value: string) => void;
    setMinDays: (value: number) => void;
    setMaxDays: (value: number) => void;
}

export const CreateTripStep2 = (props: CreateTripStep2Props) => {
    let startDateInput: HTMLInputElement | undefined;
    let endDateInput: HTMLInputElement | undefined;
    let startDatePicker: AirDatepicker<HTMLInputElement> | undefined;
    let endDatePicker: AirDatepicker<HTMLInputElement> | undefined;

    onMount(() => {
        if (startDateInput) {
            startDatePicker = new AirDatepicker(startDateInput, {
                locale: localeFr,
                dateFormat: 'yyyy-MM-dd',
                minDate: new Date(),
                maxDate: props.endDate ? new Date(props.endDate) : undefined,
                selectedDates: props.startDate ? [new Date(props.startDate)] : [],
                onSelect: ({ formattedDate }) => {
                    if (formattedDate) {
                        const newDate = Array.isArray(formattedDate) ? formattedDate[0] : formattedDate;
                        props.setStartDate(newDate);
                    }
                }
            });
        }

        if (endDateInput) {
            endDatePicker = new AirDatepicker(endDateInput, {
                locale: localeFr,
                dateFormat: 'yyyy-MM-dd',
                minDate: props.startDate ? new Date(new Date(props.startDate).getTime() + 86400000) : new Date(),
                selectedDates: props.endDate ? [new Date(props.endDate)] : [],
                onSelect: ({ formattedDate }) => {
                    if (formattedDate) {
                        const newDate = Array.isArray(formattedDate) ? formattedDate[0] : formattedDate;
                        props.setEndDate(newDate);
                    }
                }
            });
        }
    });

    createEffect(() => {
        if (startDatePicker && props.endDate) {
            startDatePicker.update({
                maxDate: new Date(props.endDate),
                selectedDates: props.startDate ? [new Date(props.startDate)] : []
            });
        }
    });

    createEffect(() => {
        if (endDatePicker && props.startDate) {
            const minEndDate = new Date(new Date(props.startDate).getTime() + 86400000);
            endDatePicker.update({
                minDate: minEndDate,
                selectedDates: props.endDate ? [new Date(props.endDate)] : []
            });
        }
    });

    createEffect(() => {
        if (props.startDate && props.endDate) {
            const start = new Date(props.startDate);
            const end = new Date(props.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                props.setMinDays(diffDays);
                props.setMaxDays(diffDays + 3);
            }
        }
    });

    const calculateDuration = () => {
        if (!props.startDate || !props.endDate) return null;
        const start = new Date(props.startDate);
        const end = new Date(props.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    };

    return (
        <div class="w-full max-w-2xl mx-auto">
            <div class="flex items-center justify-between mb-4 sm:mb-8">
                <div class="flex items-center gap-2 sm:gap-3">
                    <Calendar class="w-6 h-6 sm:w-8 sm:h-8 text-color-main" />
                    <h3 class="text-xl sm:text-2xl font-bold text-color-dark">Dates et durée</h3>
                </div>
                <span class="text-sm sm:text-base text-gray-500 font-medium">Étape {props.currentStep}/5</span>
            </div>

            <div class="space-y-4 sm:space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label class="block text-color-dark font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                            Date de début *
                        </label>
                        <input
                            ref={startDateInput}
                            type="text"
                            placeholder="Choisir une date"
                            readonly
                            class="input input-bordered w-full bg-white text-color-dark px-3 py-3 sm:px-5 sm:py-4 text-sm sm:text-lg cursor-pointer h-auto"
                        />
                    </div>

                    <div>
                        <label class="block text-color-dark font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                            Date de fin *
                        </label>
                        <input
                            ref={endDateInput}
                            type="text"
                            placeholder="Choisir une date"
                            readonly
                            class="input input-bordered w-full bg-white text-color-dark px-3 py-3 sm:px-5 sm:py-4 text-sm sm:text-lg cursor-pointer h-auto"
                        />
                    </div>
                </div>

                {calculateDuration() && (
                    <div class="bg-color-light rounded-xl p-4 sm:p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="text-color-dark font-semibold text-base sm:text-lg mb-1">Durée calculée</h4>
                                <p class="text-xs sm:text-sm text-gray-600">
                                    Basée sur vos dates
                                </p>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl sm:text-4xl font-bold text-color-main">{calculateDuration()}</div>
                                <div class="text-xs sm:text-sm text-gray-600">jours</div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                            <div class="text-center">
                                <div class="text-xl sm:text-2xl font-bold text-color-secondary">{props.minDays}</div>
                                <div class="text-xs text-gray-600">Minimum</div>
                            </div>
                            <div class="text-center">
                                <div class="text-xl sm:text-2xl font-bold text-color-secondary">{props.maxDays}</div>
                                <div class="text-xs text-gray-600">Maximum (+flexibilité)</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateTripStep2;