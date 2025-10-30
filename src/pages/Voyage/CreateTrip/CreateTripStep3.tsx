import { Show } from "solid-js";
import { Wallet } from "lucide-solid";
import type { BudgetLevel } from "../../../models";

interface CreateTripStep3Props {
    currentStep: number;
    budgetMode: "slider" | "manual";
    budgetLevel: number;
    budgetEur: number | undefined;
    minAge: number | undefined;
    maxAge: number | undefined;
    setBudgetMode: (mode: "slider" | "manual") => void;
    setBudgetLevel: (level: BudgetLevel) => void;
    setBudgetEur: (value: number | undefined) => void;
    setMinAge: (value: number | undefined) => void;
    setMaxAge: (value: number | undefined) => void;
}

export const CreateTripStep3 = (props: CreateTripStep3Props) => {
    const getRangeColor = () => {
        return props.budgetLevel === 1 ? '#45AF95' : '#DC9E53';
    };

    const handleBudgetInput = (value: string) => {
        if (!value) {
            props.setBudgetEur(undefined);
            return;
        }
        const numValue = Number(value);
        if (numValue < 0) return;
        props.setBudgetEur(numValue);
    };

    const handleMinAgeInput = (value: string) => {
        if (!value) {
            props.setMinAge(undefined);
            return;
        }
        const numValue = Number(value);
        if (numValue < 18 || numValue > 99) return;
        if (props.maxAge && numValue > props.maxAge) return;
        props.setMinAge(numValue);
    };

    const handleMaxAgeInput = (value: string) => {
        if (!value) {
            props.setMaxAge(undefined);
            return;
        }
        const numValue = Number(value);
        if (numValue < 18 || numValue > 99) return;
        if (props.minAge && numValue < props.minAge) return;
        props.setMaxAge(numValue);
    };

    return (
        <div class="w-full max-w-2xl mx-auto">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <Wallet size={32} class="text-color-secondary" />
                    <h3 class="text-2xl font-bold text-color-dark">Budget et participants</h3>
                </div>
                <span class="text-gray-500 font-medium">Étape {props.currentStep}/5</span>
            </div>
            
            <div class="space-y-8">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <label class="block text-color-dark font-semibold text-lg">
                            Budget par personne
                        </label>
                        <div class="flex gap-2">
                            <button
                                onClick={() => props.setBudgetMode("slider")}
                                class={`px-4 py-2 rounded-lg font-medium transition ${
                                    props.budgetMode === "slider"
                                        ? 'bg-color-secondary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Slider
                            </button>
                            <button
                                onClick={() => props.setBudgetMode("manual")}
                                class={`px-4 py-2 rounded-lg font-medium transition ${
                                    props.budgetMode === "manual"
                                        ? 'bg-color-secondary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Manuel
                            </button>
                        </div>
                    </div>

                    <Show when={props.budgetMode === "slider"}
                        fallback={
                            <input
                                type="number"
                                min="0"
                                max="50000"
                                step="50"
                                value={props.budgetEur || ""}
                                onInput={(e) => handleBudgetInput(e.target.value)}
                                class="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent bg-white text-color-dark"
                                placeholder="Ex: 1500"
                            />
                        }>
                        <div 
                            class="w-full"
                            style={{
                                '--range-color': getRangeColor(),
                                '--range-gradient': `linear-gradient(to right, ${getRangeColor()} 0%, ${getRangeColor()} ${((props.budgetLevel - 1) / 2) * 100}%, #E5E7EB ${((props.budgetLevel - 1) / 2) * 100}%, #E5E7EB 100%)`
                            }}
                        >
                            <input 
                                type="range" 
                                min="1" 
                                max="3" 
                                value={props.budgetLevel} 
                                onInput={(e) => props.setBudgetLevel(Number(e.target.value) as BudgetLevel)}
                                class="budget-range w-full" 
                                step="1"
                            />
                            <div class="flex justify-between mt-2">
                                <span class="text-xs font-bold" style={`color: ${props.budgetLevel === 1 ? getRangeColor() : '#9CA3AF'}`}>|</span>
                                <span class="text-xs font-bold" style={`color: ${props.budgetLevel === 2 ? getRangeColor() : '#9CA3AF'}`}>|</span>
                                <span class="text-xs font-bold" style={`color: ${props.budgetLevel === 3 ? getRangeColor() : '#9CA3AF'}`}>|</span>
                            </div>
                            <div class="flex justify-between mt-2">
                                <div class="flex flex-col items-start">
                                    <span class="text-2xl font-bold mb-1" style={`color: ${props.budgetLevel === 1 ? getRangeColor() : '#9CA3AF'}`}>€</span>
                                    <span class="text-xs text-gray-600">0-1250€</span>
                                </div>
                                <div class="flex flex-col items-center">
                                    <span class="text-2xl font-bold mb-1" style={`color: ${props.budgetLevel === 2 ? getRangeColor() : '#9CA3AF'}`}>€€</span>
                                    <span class="text-xs text-gray-600">1250-2500€</span>
                                </div>
                                <div class="flex flex-col items-end">
                                    <span class="text-2xl font-bold mb-1" style={`color: ${props.budgetLevel === 3 ? getRangeColor() : '#9CA3AF'}`}>€€€</span>
                                    <span class="text-xs text-gray-600">{'>'} 2500€</span>
                                </div>
                            </div>
                        </div>
                    </Show>
                </div>

                <div class="bg-color-light rounded-xl p-6">
                    <h4 class="text-color-dark font-semibold mb-4 text-lg">Âge des participants (optionnel)</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-color-dark font-medium mb-2">
                                Âge minimum
                            </label>
                            <input
                                type="number"
                                min="18"
                                max={props.maxAge || 99}
                                value={props.minAge || ""}
                                onInput={(e) => handleMinAgeInput(e.target.value)}
                                class="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent bg-white text-color-dark"
                                placeholder="18"
                            />
                        </div>
                        <div>
                            <label class="block text-color-dark font-medium mb-2">
                                Âge maximum
                            </label>
                            <input
                                type="number"
                                min={props.minAge || 18}
                                max="99"
                                value={props.maxAge || ""}
                                onInput={(e) => handleMaxAgeInput(e.target.value)}
                                class="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent bg-white text-color-dark"
                                placeholder="35"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTripStep3;