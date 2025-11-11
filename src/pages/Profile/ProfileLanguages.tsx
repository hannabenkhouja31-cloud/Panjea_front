import { Show, For } from "solid-js";
import { Languages } from "lucide-solid";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type LanguageCode } from "../../models";
import type { ProfileLanguagesProps } from "./types";
import { LANGUAGE_TO_FLAG } from "./utils";

export const ProfileLanguages = (props: ProfileLanguagesProps) => {
    return (
        <div class="text-black border-l-3 border-[#DC9E53] p-8">
            <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-color-secondary rounded-lg backdrop-blur-sm">
                    <Languages size={24} color="white" stroke-width={2.5}/>
                </div>
                <h3 class="text-xl font-bold text-black">Langues parlées</h3>
            </div>
            <Show when={!props.isEditing}
                fallback={
                    <div>
                        <div class="flex items-center gap-4 mb-4 flex-wrap">
                            <For each={props.editLanguages}>
                                {(lang, index) => (
                                    <div class="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => props.onSelectLanguageIndex(index())}
                                            class={`cursor-pointer  flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition ${
                                                props.selectedLanguageIndex === index()
                                                    ? 'bg-white text-[#DC9E53]'
                                                    : 'bg-white/20 text-black hover:bg-[#DC9E53] '
                                            }`}
                                        >
                                            {lang ? (
                                                <>
                                                    <span class={`fi fi-${LANGUAGE_TO_FLAG[lang]}`}></span>
                                                    <span>Langue {index() + 1}</span>
                                                </>
                                            ) : (
                                                <span>Langue {index() + 1}</span>
                                            )}
                                        </button>
                                        {props.editLanguages.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={(e) => props.onRemoveLanguage(e, index())}
                                                class="flex items-center justify-center w-6 h-6 rounded-full text-black/70 hover:text-white hover:bg-black/20 transition"
                                            >
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </For>

                            {props.editLanguages.length < SUPPORTED_LANGUAGES.length && (
                                <button
                                    type="button"
                                    onClick={(e) => props.onAddLanguage(e)}
                                    class="flex items-center justify-center w-8 h-8 rounded-full bg-[#DC9E53] text-[#45AF95] hover:bg-white/90 transition transform hover:scale-110"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {props.editLanguages[props.selectedLanguageIndex] ? (
                            <div class="dropdown dropdown-hover w-full">
                                <div 
                                    tabindex="0" 
                                    role="button" 
                                    class="w-full px-5 py-4 text-lg border-2 border-[#DC9E53]/30 rounded-xl bg-white/10 backdrop-blur-sm hover:border-white/50 transition cursor-pointer flex items-center gap-3"
                                >
                                    <span class={`fi fi-${LANGUAGE_TO_FLAG[props.editLanguages[props.selectedLanguageIndex]]}`}></span>
                                    <span class="flex-1 text-left text-black font-medium">
                                        {LANGUAGE_LABELS[props.editLanguages[props.selectedLanguageIndex]]}
                                    </span>
                                    <svg class="w-5 h-5 text-[#DC9E53]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <ul 
                                    tabindex="0" 
                                    class="dropdown-content menu bg-white rounded-xl z-10 w-full p-2 shadow-xl border border-gray-200 max-h-60 overflow-y-auto"
                                >
                                    <For each={props.getAvailableLanguages(props.selectedLanguageIndex)}>
                                        {(lang) => (
                                            <li class="list-none">
                                                <a 
                                                    onClick={() => props.onUpdateLanguage(props.selectedLanguageIndex, lang as LanguageCode)}
                                                    class={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#45AF95]/10 transition cursor-pointer text-color-dark no-underline ${
                                                        props.editLanguages[props.selectedLanguageIndex] === lang 
                                                            ? 'bg-[#45AF95]/10 text-[#45AF95] font-semibold' 
                                                            : ''
                                                    }`}
                                                >
                                                    <span class={`fi fi-${LANGUAGE_TO_FLAG[lang as LanguageCode]}`}></span>
                                                    <span>{LANGUAGE_LABELS[lang as LanguageCode]}</span>
                                                </a>
                                            </li>
                                        )}
                                    </For>
                                </ul>
                            </div>
                        ) : (
                            <div class="dropdown dropdown-hover w-full">
                                <div 
                                    tabindex="0" 
                                    role="button" 
                                    class="w-full px-5 py-4 text-lg border-2 border-white/30 rounded-xl bg-white/10 backdrop-blur-sm hover:border-white/50 transition cursor-pointer flex items-center gap-3"
                                >
                                    <span class="flex-1 text-left text-black/60">Sélectionnez une langue</span>
                                    <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <ul 
                                    tabindex="0" 
                                    class="dropdown-content menu bg-white rounded-xl z-10 w-full p-2 shadow-xl border border-gray-200 max-h-60 overflow-y-auto"
                                >
                                    <For each={props.getAvailableLanguages(props.selectedLanguageIndex)}>
                                        {(lang) => (
                                            <li class="list-none">
                                                <a 
                                                    onClick={() => props.onUpdateLanguage(props.selectedLanguageIndex, lang as LanguageCode)}
                                                    class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#45AF95]/10 transition cursor-pointer text-color-dark no-underline"
                                                >
                                                    <span class={`fi fi-${LANGUAGE_TO_FLAG[lang as LanguageCode]}`}></span>
                                                    <span>{LANGUAGE_LABELS[lang as LanguageCode]}</span>
                                                </a>
                                            </li>
                                        )}
                                    </For>
                                </ul>
                            </div>
                        )}
                    </div>
                }>
                <div class="flex gap-3 flex-wrap">
                    <Show when={props.languages && props.languages.length > 0}
                        fallback={<span class="text-black/60 italic text-lg">Aucune langue renseignée</span>}>
                        <For each={props.languages}>
                            {(lang) => (
                                <div class="flex items-center gap-2 px-4 py-2 bg-[#DC9E53]/20 backdrop-blur-sm rounded-full">
                                    <span class={`fi fi-${LANGUAGE_TO_FLAG[lang]}`}></span>
                                    <span class="text-sm font-medium text-black">
                                        {LANGUAGE_LABELS[lang]}
                                    </span>
                                </div>
                            )}
                        </For>
                    </Show>
                </div>
            </Show>
        </div>
    );
};