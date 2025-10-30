import { Show } from "solid-js";
import { Wallet } from "lucide-solid";
import type { BudgetLevel } from "../../models";
import type { UserProfile } from "../../stores/userStore";

interface ProfileBudgetProps {
    profile: UserProfile | null;
    isEditing: boolean;
    editBudgetLevel: BudgetLevel;
    onBudgetChange: (value: BudgetLevel) => void;
}

const BUDGET_SYMBOLS = {
    1: "€",
    2: "€€",
    3: "€€€"
};

const BUDGET_LABELS = {
    1: "0-1250€",
    2: "1250-2500€",
    3: ">2500€"
};

export const ProfileBudget = (props: ProfileBudgetProps) => {
    const getRangeColor = () => {
        return props.editBudgetLevel === 1 ? '#146865' : '#146865';
    };

    return (
        <div class="text-black border-l-3 border-[#146865] p-8 ">
            <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-color-main rounded-lg backdrop-blur-sm">
                    <Wallet size={24} color="white" stroke-width={2.5}/>
                </div>
                <h3 class="text-xl font-bold text-black">Budget voyage</h3>
            </div>
            <Show when={!props.isEditing}
                fallback={
                    <div 
                        class="w-full"
                        style={{
                            '--range-color': getRangeColor(),
                            '--range-gradient': `linear-gradient(to right, ${getRangeColor()} 0%, ${getRangeColor()} ${((props.editBudgetLevel - 1) / 2) * 100}%, rgba(255,255,255,0.3) ${((props.editBudgetLevel - 1) / 2) * 100}%, rgba(255,255,255,0.3) 100%)`
                        }}
                    >
                        <input 
                            type="range" 
                            min="1" 
                            max="3" 
                            value={props.editBudgetLevel} 
                            onInput={(e) => props.onBudgetChange(Number(e.target.value) as BudgetLevel)}
                            class="budget-range w-full" 
                            step="1"
                        />
                        <div class="flex justify-between mt-2">
                            <span class="text-xs font-bold text-[#146865]/70">|</span>
                            <span class="text-xs font-bold text-[#146865]/70">|</span>
                            <span class="text-xs font-bold text-[#146865]/70">|</span>
                        </div>
                        <div class="flex justify-between mt-2">
                            <div class="flex flex-col items-start">
                                <span class={`text-2xl font-bold mb-1 ${props.editBudgetLevel === 1 ? 'text-[#146865]' : 'text-[#146865]/40'}`}>
                                    {BUDGET_SYMBOLS[1]}
                                </span>
                                <span class="text-xs text-black/80">{BUDGET_LABELS[1]}</span>
                            </div>
                            <div class="flex flex-col items-center">
                                <span class={`text-2xl font-bold mb-1 ${props.editBudgetLevel === 2 ? 'text-[#146865]' : 'text-[#146865]/40'}`}>
                                    {BUDGET_SYMBOLS[2]}
                                </span>
                                <span class="text-xs text-black/80">{BUDGET_LABELS[2]}</span>
                            </div>
                            <div class="flex flex-col items-end">
                                <span class={`text-2xl font-bold mb-1 ${props.editBudgetLevel === 3 ? 'text-[#146865]' : 'text-[#146865]/40'}`}>
                                    {BUDGET_SYMBOLS[3]}
                                </span>
                                <span class="text-xs text-black/80">{BUDGET_LABELS[3]}</span>
                            </div>
                        </div>
                    </div>
                }>
                <div class="flex items-center gap-4">
                    <div class="flex gap-1">
                        <span class={`text-3xl ${props.profile?.budgetLevel === 1 ? "text-[#146865]" : "text-[#146865]/50"}`}>€</span>
                        <span class={`text-3xl ${props.profile?.budgetLevel === 2 ? "text-[#146865]" : "text-[#146865]/50"}`}>€</span>
                        <span class={`text-3xl ${props.profile?.budgetLevel === 3 ? "text-[#146865]" : "text-[#146865]/50"}`}>€</span>
                    </div>
                    <Show when={props.profile?.budgetLevel}>
                        <span class="text-lg text-black font-medium">
                            {props.profile?.budgetLevel === 1 ? "Économique" : props.profile?.budgetLevel === 2 ? "Moyen" : "Élevé"}
                        </span>
                    </Show>
                </div>
            </Show>
        </div>
    );
};