import { createSignal, createEffect } from "solid-js";
import AirDatepicker from "air-datepicker";
import localeFr from "air-datepicker/locale/fr";
import { getTripById, trip, updateTrip } from "../../../../stores/tripStore";


export const useTripEdit = () => {
    const [isEditing, setIsEditing] = createSignal(false);
    const [hasChanges, setHasChanges] = createSignal(false);
    
    const [editTitle, setEditTitle] = createSignal("");
    const [editSummary, setEditSummary] = createSignal("");
    const [editStartDate, setEditStartDate] = createSignal("");
    const [editEndDate, setEditEndDate] = createSignal("");
    const [editMinDays, setEditMinDays] = createSignal(1);
    const [editMaxDays, setEditMaxDays] = createSignal(7);
    const [editBudgetEur, setEditBudgetEur] = createSignal<number | undefined>(undefined);
    const [editMinAge, setEditMinAge] = createSignal<number | undefined>(undefined);
    const [editMaxAge, setEditMaxAge] = createSignal<number | undefined>(undefined);
    const [editTravelTypes, setEditTravelTypes] = createSignal<string[]>([]);

    let startDateInput: HTMLInputElement | undefined;
    let endDateInput: HTMLInputElement | undefined;
    let startDatePicker: AirDatepicker<HTMLInputElement> | undefined;
    let endDatePicker: AirDatepicker<HTMLInputElement> | undefined;

    createEffect(() => {
        if (isEditing() && trip.currentTrip) {
            setEditTitle(trip.currentTrip.title || "");
            setEditSummary(trip.currentTrip.summary || "");
            setEditStartDate((trip.currentTrip as any).startDate || "");
            setEditEndDate((trip.currentTrip as any).endDate || "");
            setEditMinDays(trip.currentTrip.minDays || 1);
            setEditMaxDays(trip.currentTrip.maxDays || 7);
            setEditBudgetEur(trip.currentTrip.budgetEur);
            setEditMinAge(trip.currentTrip.minAge);
            setEditMaxAge(trip.currentTrip.maxAge);
            setEditTravelTypes([...((trip.currentTrip as any).travelTypes || [])]);

            if (startDateInput && !startDatePicker) {
                startDatePicker = new AirDatepicker(startDateInput, {
                    locale: localeFr,
                    dateFormat: 'yyyy-MM-dd',
                    minDate: new Date(),
                    selectedDates: editStartDate() ? [new Date(editStartDate())] : [],
                    onSelect: ({ formattedDate }) => {
                        if (formattedDate) {
                            const newDate = Array.isArray(formattedDate) ? formattedDate[0] : formattedDate;
                            setEditStartDate(newDate);
                        }
                    }
                });
            }

            if (endDateInput && !endDatePicker) {
                endDatePicker = new AirDatepicker(endDateInput, {
                    locale: localeFr,
                    dateFormat: 'yyyy-MM-dd',
                    minDate: editStartDate() ? new Date(new Date(editStartDate()).getTime() + 86400000) : new Date(),
                    selectedDates: editEndDate() ? [new Date(editEndDate())] : [],
                    onSelect: ({ formattedDate }) => {
                        if (formattedDate) {
                            const newDate = Array.isArray(formattedDate) ? formattedDate[0] : formattedDate;
                            setEditEndDate(newDate);
                        }
                    }
                });
            }
        }
    });

    createEffect(() => {
        if (isEditing() && trip.currentTrip) {
            const titleChanged = editTitle() !== (trip.currentTrip.title || "");
            const summaryChanged = editSummary() !== (trip.currentTrip.summary || "");
            const startDateChanged = editStartDate() !== ((trip.currentTrip as any).startDate || "");
            const endDateChanged = editEndDate() !== ((trip.currentTrip as any).endDate || "");
            const minDaysChanged = editMinDays() !== (trip.currentTrip.minDays || 1);
            const maxDaysChanged = editMaxDays() !== (trip.currentTrip.maxDays || 7);
            const budgetChanged = editBudgetEur() !== trip.currentTrip.budgetEur;
            const minAgeChanged = editMinAge() !== trip.currentTrip.minAge;
            const maxAgeChanged = editMaxAge() !== trip.currentTrip.maxAge;
            const travelTypesChanged = JSON.stringify(editTravelTypes()) !== JSON.stringify((trip.currentTrip as any).travelTypes || []);

            setHasChanges(titleChanged || summaryChanged || startDateChanged || endDateChanged || minDaysChanged || maxDaysChanged || budgetChanged || minAgeChanged || maxAgeChanged || travelTypesChanged);
        }
    });

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setHasChanges(false);
        if (startDatePicker) {
            startDatePicker.destroy();
            startDatePicker = undefined;
        }
        if (endDatePicker) {
            endDatePicker.destroy();
            endDatePicker = undefined;
        }
    };

    const handleSave = async (temporaryMediaIds: string[]) => {
        if (!trip.currentTrip?.id) return;

        const updateData = {
            title: editTitle(),
            summary: editSummary() || undefined,
            startDate: editStartDate(),
            endDate: editEndDate(),
            minDays: editMinDays(),
            maxDays: editMaxDays(),
            budgetEur: editBudgetEur(),
            minAge: editMinAge(),
            maxAge: editMaxAge(),
            travelTypes: editTravelTypes(),
            temporaryMediaIds
        };

        const result = await updateTrip(trip.currentTrip.id, updateData);

        if (result.success) {
            await getTripById(trip.currentTrip.id);
            setIsEditing(false);
            setHasChanges(false);
            if (startDatePicker) {
                startDatePicker.destroy();
                startDatePicker = undefined;
            }
            if (endDatePicker) {
                endDatePicker.destroy();
                endDatePicker = undefined;
            }
            return true;
        }
        return false;
    };

    const toggleTravelType = (slug: string) => {
        if (editTravelTypes().includes(slug)) {
            if (editTravelTypes().length > 3) {
                setEditTravelTypes(editTravelTypes().filter(s => s !== slug));
            }
        } else {
            setEditTravelTypes([...editTravelTypes(), slug]);
        }
    };

    return {
        isEditing,
        hasChanges,
        editTitle,
        setEditTitle,
        editSummary,
        setEditSummary,
        editStartDate,
        editEndDate,
        editMinDays,
        setEditMinDays,
        editMaxDays,
        setEditMaxDays,
        editBudgetEur,
        setEditBudgetEur,
        editMinAge,
        setEditMinAge,
        editMaxAge,
        setEditMaxAge,
        editTravelTypes,
        toggleTravelType,
        handleEdit,
        handleCancel,
        handleSave,
        startDateInput,
        endDateInput,
        setStartDateInput: (el: HTMLInputElement) => { startDateInput = el; },
        setEndDateInput: (el: HTMLInputElement) => { endDateInput = el; }
    };
};