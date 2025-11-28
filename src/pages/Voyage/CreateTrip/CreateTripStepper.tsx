import { For, Show } from "solid-js";
import { Check } from "lucide-solid";

interface CreateTripStepperProps {
    currentStep: number;
    completedSteps: number[];
    canGoToStep: (step: number) => boolean;
    goToStep: (step: number) => void;
}

export const CreateTripStepper = (props: CreateTripStepperProps) => {
    return (
        <div class="mb-4 sm:mb-8 w-full">
            <div class="max-w-4xl mx-auto flex items-center justify-center">
                <For each={[1, 2, 3, 4, 5]}>
                    {(step) => (
                        <div class="flex items-center">
                            <button
                                onClick={() => props.goToStep(step)}
                                disabled={!props.canGoToStep(step)}
                                class={`w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg transition-all
                                    ${props.currentStep === step
                                    ? 'bg-color-main text-white scale-110 shadow-lg'
                                    : props.completedSteps.includes(step)
                                        ? 'bg-color-main text-white hover:scale-105 cursor-pointer'
                                        : props.canGoToStep(step)
                                            ? 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-pointer'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Show when={props.completedSteps.includes(step) && props.currentStep !== step} fallback={step}>
                                    <Check size={16} class="sm:w-6 sm:h-6" />
                                </Show>
                            </button>
                            <Show when={step < 5}>
                                <div class={`w-4 sm:w-12 md:w-16 h-1 mx-0.5 sm:mx-1 transition-colors
                                    ${props.completedSteps.includes(step) ? 'bg-color-main' : 'bg-gray-300'}`}
                                />
                            </Show>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
};

export default CreateTripStepper;