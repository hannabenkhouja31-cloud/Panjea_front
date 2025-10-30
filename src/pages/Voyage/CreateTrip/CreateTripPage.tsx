import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createTrip, getAllTrips } from "../../../stores/tripStore";
import { getUserMemberTripsFromDatabase, setUserTrips, user } from "../../../stores/userStore";
import { backend } from "../../../stores/configStore";
import { startLoading, stopLoading } from "../../../stores/loaderStore";
import CreateTripStepper from "./CreateTripStepper";
import CreateTripStep1 from "./CreateTripStep1";
import CreateTripStep2 from "./CreateTripStep2";
import CreateTripStep3 from "./CreateTripStep3";
import CreateTripStep4 from "./CreateTripStep4";
import CreateTripStep5 from "./CreateTripStep5";
import CreateTripModal from "./CreateTripModal";
import { joinTripRoom } from "../../../stores/websocketStore";
import { getLastMessagesByTrips } from "../../../stores/messagesStore";

interface TemporaryMedia {
    id: string;
    url: string;
}

export const CreateTripPage = () => {
    const navigate = useNavigate();
    
    const [currentStep, setCurrentStep] = createSignal(1);
    const [completedSteps, setCompletedSteps] = createSignal<number[]>([]);
    
    const [title, setTitle] = createSignal("");
    const [destinationCountry, setDestinationCountry] = createSignal("");
    const [summary, setSummary] = createSignal("");
    const [startDate, setStartDate] = createSignal("");
    const [endDate, setEndDate] = createSignal("");
    const [minDays, setMinDays] = createSignal<number>(1);
    const [maxDays, setMaxDays] = createSignal<number>(7);
    const [budgetEur, setBudgetEur] = createSignal<number | undefined>(undefined);
    const [budgetMode, setBudgetMode] = createSignal<"slider" | "manual">("slider");
    const [budgetLevel, setBudgetLevel] = createSignal(1);
    const [minAge, setMinAge] = createSignal<number | undefined>(undefined);
    const [maxAge, setMaxAge] = createSignal<number | undefined>(undefined);
    const [selectedTravelTypes, setSelectedTravelTypes] = createSignal<string[]>([]);
    const [temporaryMedia, setTemporaryMedia] = createSignal<TemporaryMedia[]>([]);
    
    const [error, setError] = createSignal("");

    onMount(() => {
        
        if (user.profile?.budgetLevel) {
            setBudgetLevel(user.profile.budgetLevel);
        }
        
        if (user.profile?.travelTypes && user.profile.travelTypes.length >= 3) {
            const travelTypeSlugs = user.profile.travelTypes.map(type => type.slug);
            setSelectedTravelTypes(travelTypeSlugs);
        }
    });

    const travelTypes = () => {
        if (!backend.travelTypes) return [];
        if (Array.isArray(backend.travelTypes)) return backend.travelTypes;
        return [];
    };

    const toggleTravelType = (slug: string) => {
        if (selectedTravelTypes().includes(slug)) {
            setSelectedTravelTypes(selectedTravelTypes().filter(s => s !== slug));
        } else {
            setSelectedTravelTypes([...selectedTravelTypes(), slug]);
        }
    };

    const getBudgetFromLevel = (level: number): number => {
        if (level === 1) return 625;
        if (level === 2) return 1875;
        return 3750;
    };

    const canGoToStep = (step: number): boolean => {
        if (step === 1) return true;
        
        if (step === 2) return validateStep1();
        if (step === 3) return validateStep1() && validateStep2();
        if (step === 4) return validateStep1() && validateStep2() && validateStep3();
        if (step === 5) return validateStep1() && validateStep2() && validateStep3() && validateStep4();
        
        return false;
    };

    const validateStep1 = (): boolean => {
        return title().trim().length > 0 && destinationCountry().trim().length > 0;
    };

    const validateStep2 = (): boolean => {
        return startDate().length > 0 && endDate().length > 0 && minDays() > 0 && maxDays() >= minDays();
    };

    const validateStep3 = (): boolean => {
        if (budgetMode() === "manual" && budgetEur() !== undefined && budgetEur()! < 0) {
            return false;
        }
        
        if (minAge() !== undefined && (minAge()! < 18 || minAge()! > 99)) {
            return false;
        }
        
        if (maxAge() !== undefined && (maxAge()! < 18 || maxAge()! > 99)) {
            return false;
        }
        
        if (minAge() !== undefined && maxAge() !== undefined && minAge()! >= maxAge()!) {
            return false;
        }
        
        return true;
    };

    const validateStep4 = (): boolean => {
        return selectedTravelTypes().length >= 3;
    };

    const goToStep = (step: number) => {
        if (canGoToStep(step)) {
            setCurrentStep(step);
            setError("");
        }
    };

    const nextStep = () => {
        setError("");
        
        if (currentStep() === 1 && !validateStep1()) {
            setError("Veuillez remplir le titre et la destination");
            return;
        }
        
        if (currentStep() === 2 && !validateStep2()) {
            setError("Veuillez remplir les dates et la durée correctement");
            return;
        }

        if (currentStep() === 3 && !validateStep3()) {
            setError("Valeurs invalides : vérifiez le budget et les âges (min < max, 18-99 ans)");
            return;
        }
        
        if (currentStep() === 4 && !validateStep4()) {
            setError("Veuillez sélectionner au moins 3 types de voyage");
            return;
        }
        
        if (!completedSteps().includes(currentStep())) {
            setCompletedSteps([...completedSteps(), currentStep()]);
        }
        
        if (currentStep() < 5) {
            setCurrentStep(currentStep() + 1);
        }
    };

    const previousStep = () => {
        if (currentStep() > 1) {
            setCurrentStep(currentStep() - 1);
            setError("");
        }
    };

    const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep4()) {
        setError("Veuillez compléter toutes les étapes requises");
        return;
    }

    if (!user.profile?.id) {
        setError("Utilisateur non connecté");
        return;
    }

    startLoading();

    const finalBudget = budgetMode() === "manual" ? budgetEur() : getBudgetFromLevel(budgetLevel());

    const tripData = {
        title: title(),
        destinationCountry: destinationCountry(),
        startDate: startDate(),
        endDate: endDate(),
        minDays: minDays(),
        maxDays: maxDays(),
        organizerId: user.profile.id,
        travelTypes: selectedTravelTypes(),
        summary: summary() || undefined,
        budgetEur: finalBudget,
        minAge: minAge(),
        maxAge: maxAge(),
        temporaryMediaIds: temporaryMedia().map(m => m.id),
    };


    const result = await createTrip(tripData);

    if (result.success) {
        
        const memberTrips = await getUserMemberTripsFromDatabase(user.profile.id);
        if (memberTrips.success && memberTrips.data) {
            setUserTrips(memberTrips.data);
            
            joinTripRoom(result.data.id, user.profile.id);
            
            await getLastMessagesByTrips([result.data.id], user.profile.id);
        }
        
        await getAllTrips();
        
        stopLoading();
        navigate("/conversations");
    } else {
        setError(result.error || "Erreur lors de la création du voyage");
        stopLoading();
    }
};

    return (
        <div class="container-app-narrow pb-16 pt-24 flex-1 min-h-screen bg-color-light">
            <div class="max-w-4xl mx-auto">
                <CreateTripStepper
                    currentStep={currentStep()}
                    completedSteps={completedSteps()}
                    canGoToStep={canGoToStep}
                    goToStep={goToStep}
                />

                <div class="bg-white rounded-2xl shadow-xl mb-6 min-h-[60vh] flex flex-col">
                    {error() && (
                        <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-center animate-shake">
                            {error()}
                        </div>
                    )}

                    <div class="flex-1 flex overflow-y-auto justify-center items-center w-full ">
                        {currentStep() === 1 && (
                            <CreateTripStep1
                                currentStep={currentStep()}
                                title={title()}
                                destinationCountry={destinationCountry()}
                                summary={summary()}
                                setTitle={setTitle}
                                setDestinationCountry={setDestinationCountry}
                                setSummary={setSummary}
                            />
                        )}
                        {currentStep() === 2 && (
                            <CreateTripStep2
                                currentStep={currentStep()}
                                startDate={startDate()}
                                endDate={endDate()}
                                minDays={minDays()}
                                maxDays={maxDays()}
                                setStartDate={setStartDate}
                                setEndDate={setEndDate}
                                setMinDays={setMinDays}
                                setMaxDays={setMaxDays}
                            />
                        )}
                        {currentStep() === 3 && (
                            <CreateTripStep3
                                currentStep={currentStep()}
                                budgetMode={budgetMode()}
                                budgetLevel={budgetLevel()}
                                budgetEur={budgetEur()}
                                minAge={minAge()}
                                maxAge={maxAge()}
                                setBudgetMode={setBudgetMode}
                                setBudgetLevel={setBudgetLevel}
                                setBudgetEur={setBudgetEur}
                                setMinAge={setMinAge}
                                setMaxAge={setMaxAge}
                            />
                        )}
                        {currentStep() === 4 && (
                            <CreateTripStep4
                                currentStep={currentStep()}
                                selectedTravelTypes={selectedTravelTypes()}
                                travelTypes={travelTypes()}
                                toggleTravelType={toggleTravelType}
                            />
                        )}
                        {currentStep() === 5 && (
                            <CreateTripStep5 
                                currentStep={currentStep()} 
                                temporaryMedia={temporaryMedia()}
                                setTemporaryMedia={setTemporaryMedia}
                            />
                        )}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <button
                        onClick={previousStep}
                        disabled={currentStep() === 1}
                        class={`w-full py-5 rounded-xl font-bold text-lg transition-all ${
                            currentStep() === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:scale-[1.02]'
                        }`}
                    >
                        Précédent
                    </button>

                    {currentStep() < 5 ? (
                        <button
                            onClick={nextStep}
                            class="w-full py-5 rounded-xl font-bold text-lg bg-color-secondary text-white hover:scale-[1.02] transition-all"
                        >
                            Suivant
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            class="w-full py-5 rounded-xl font-bold text-lg bg-color-main text-white hover:bg-gradient-main hover:scale-[1.02] transition-all"
                        >
                            Créer le voyage
                        </button>
                    )}
                </div>
            </div>

            <CreateTripModal
                selectedTravelTypes={selectedTravelTypes()}
                travelTypes={travelTypes()}
                toggleTravelType={toggleTravelType}
            />
        </div>
    );
};

export default CreateTripPage;