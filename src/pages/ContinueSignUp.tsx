import { createSignal, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type BudgetLevel, type LanguageCode, type TravelType } from "../models";
import { backend, createUserInDatabase, getNeonApp } from "../stores/configStore";
import { getUserFromDatabase, getUserTripsFromDatabase, login, setCanRegister, setRegisterBudgetLevel, setRegisterLanguages, setRegisterPseudo, setRegisterTravelTypes, setRegisterUserId, setUserProfile, setUserTrips, user } from "../stores/userStore";
import { startLoading, stopLoading } from "../stores/loaderStore";
import { getAllTrips } from "../stores/tripStore";

const LANGUAGE_TO_FLAG: Record<LanguageCode, string> = {
    fr: 'fr',
    en: 'gb',
    es: 'es',
    de: 'de',
    it: 'it',
    pt: 'pt',
    nl: 'nl',
    pl: 'pl',
    ru: 'ru',
    ja: 'jp',
    zh: 'cn',
    ar: 'sa',
    hi: 'in',
    tr: 'tr',
    ko: 'kr'
};

const BUDGET_LABELS = {
    1: "0-1250€",
    2: "1250-2500€",
    3: ">2500€"
};

const BUDGET_SYMBOLS = {
    1: "€",
    2: "€€",
    3: "€€€"
};

export const ContinueSignUp = () => {

    let myModalTravel: HTMLDialogElement | undefined;

    const navigate = useNavigate();
    const [pseudo, setPseudo] = createSignal("");
    const [error, setError] = createSignal("");
    const [languages, setLanguages] = createSignal<LanguageCode[]>(["fr"]);
    const [selectedIndex, setSelectedIndex] = createSignal(0);
    const [selectedTravelTypeSlugs, setSelectedTravelTypeSlugs] = createSignal<string[]>([]);
    const [budgetLevel, setBudgetLevel] = createSignal(1);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError("");

        startLoading();

        if (!pseudo()) {
            setError("Le pseudo est requis");
            stopLoading();
            return;
        }

        const validLanguages = languages().filter(lang => lang !== null && lang !== undefined);
        if (validLanguages.length === 0) {
            setError("Veuillez sélectionner au moins une langue");
            stopLoading();
            return;
        }

        if (selectedTravelTypeSlugs().length < 3) {
            setError("Veuillez sélectionner au moins 3 types de voyage");
            stopLoading();
            return;
        }

        setRegisterPseudo(pseudo());
        setRegisterLanguages(validLanguages);
        setRegisterBudgetLevel(budgetLevel() as BudgetLevel);
        setRegisterTravelTypes(selectedTravelTypeSlugs() as unknown as TravelType[]);

        const neonApp = getNeonApp();
        const registerInfos = user.registerInfos;

        try {
            const result = await neonApp?.signUpWithCredential({
                email: registerInfos.email,
                password: registerInfos.password,
            });

            if (result?.status === 'error') {
                setError(`Inscription échouée: ${result.error.humanReadableMessage}`);
                stopLoading();
                return;
            }

            const neonUser = await neonApp?.getUser();
            if (!neonUser?.id) {
                setError("Erreur lors de la récupération de l'utilisateur");
                stopLoading();
                return;
            }

            setCanRegister(true);
            setRegisterUserId(neonUser.id);

            const dbResult = await createUserInDatabase({
                id: neonUser.id,
                username: pseudo(),
                languages: validLanguages,
                budgetLevel: budgetLevel() as BudgetLevel,
                travelTypes: selectedTravelTypeSlugs() as unknown as TravelType[],
            });

            if (!dbResult.success) {
                setError(dbResult.error || "Erreur lors de la création de l'utilisateur");
                stopLoading();
                return;
            }

            const signInResult = await neonApp?.signInWithCredential({
                email: registerInfos.email,
                password: registerInfos.password,
            });

            if (signInResult?.status === 'error') {
                setError(`Inscription créée mais connexion échouée : ${signInResult.error.humanReadableMessage}`);
                stopLoading();
                return;
            }

            const dbUser = await getUserFromDatabase(neonUser.id);

            if (dbUser.success && dbUser.data) {
                setUserProfile({
                    id: dbUser.data.id,
                    username: dbUser.data.username,
                    languages: dbUser.data.languages,
                    budgetLevel: dbUser.data.budgetLevel,
                    travelTypes: dbUser.data.travelTypes || [],
                    city: dbUser.data.city,
                    country: dbUser.data.country,
                    tripsCount: dbUser.data.tripsCount,
                    description: dbUser.data.description,
                    profilePictureUrl: dbUser.data.profilePictureUrl,
                    isVerified: dbUser.data.isVerified
                });

                const userTrips = await getUserTripsFromDatabase(dbUser.data.id);
                if (userTrips.success && userTrips.data) {
                    setUserTrips(userTrips.data);
                }
            }

            await getAllTrips();

            login();
            stopLoading();
            navigate("/inscription/photo", { replace: true });


        } catch (err) {
            setError("Erreur de connexion au serveur");
            stopLoading();
        }
    };

    const addLanguage = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const availableLanguages = SUPPORTED_LANGUAGES.filter(
            lang => !languages().includes(lang as LanguageCode)
        );
        
        if (availableLanguages.length > 0) {
            const currentLangs = languages();
            setLanguages([...currentLangs, null as any]);
            setSelectedIndex(currentLangs.length);
        }
    };

    const removeLanguage = (e: MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (languages().length > 1) {
            const newLanguages = languages().filter((_, i) => i !== index);
            setLanguages(newLanguages);
            if (selectedIndex() >= newLanguages.length) {
                setSelectedIndex(Math.max(0, newLanguages.length - 1));
            } else if (selectedIndex() === index) {
                setSelectedIndex(0);
            }
        }
    };

    const updateLanguage = (index: number, newLang: LanguageCode) => {
        const newLanguages = [...languages()];
        newLanguages[index] = newLang;
        setLanguages(newLanguages);
    };

    const getAvailableLanguages = (currentIndex: number) => {
        const currentLang = languages()[currentIndex];
        return SUPPORTED_LANGUAGES.filter(
            lang => !languages().includes(lang as LanguageCode) || currentLang === lang
        );
    };

    const travelTypes = () => {
        if (!backend.travelTypes) return [];
        if (Array.isArray(backend.travelTypes)) return backend.travelTypes;
        return [];
    };

    const toggleTravelType = (slug: string) => {
        if (selectedTravelTypeSlugs().includes(slug)) {
            setSelectedTravelTypeSlugs(selectedTravelTypeSlugs().filter(s => s !== slug));
        } else {
            setSelectedTravelTypeSlugs([...selectedTravelTypeSlugs(), slug]);
        }
    };

    const getRangeColor = () => {
        return budgetLevel() === 1 ? '#45AF95' : '#DC9E53';
    };

    return (
        <div class="py-20 flex-1 flex items-center justify-center bg-color-light px-6">
            <div class="bg-white rounded-2xl shadow-xl p-12 w-full max-w-2xl transform transition-all duration-300 hover:shadow-2xl">
                <div class="text-center mb-10">
                    <h1 class="text-3xl font-bold text-color-dark mb-3 animate-fade-in">
                        Complétez votre profil
                    </h1>
                    <p class="text-gray-500 text-xl mt-4 animate-fade-in-delay">
                        🚀 Prêt pour voyager ? 
                    </p>
                </div>

                {error() && (
                    <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 text-base animate-shake">
                        {error()}
                    </div>
                )}

                <form onSubmit={handleSubmit} class="space-y-6">
                    <div>
                        <label class="block text-color-dark font-semibold mb-3 text-lg">
                            Pseudo
                        </label>
                        <input
                            type="text"
                            value={pseudo()}
                            onInput={(e) => setPseudo(e.target.value)}
                            class="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition transform focus:scale-[1.01]"
                            placeholder="Choisissez votre pseudo"
                            required
                        />
                    </div>

                    <div>
                        <div class="flex items-center gap-4 mb-4 flex-wrap">
                            <label class="block text-color-dark font-semibold text-lg">
                                Langues
                            </label>
                            
                            <For each={languages()}>
                                {(lang, index) => (
                                    <div class="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedIndex(index())}
                                            class={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition ${
                                                selectedIndex() === index()
                                                    ? 'bg-color-main text-white'
                                                    : 'bg-gray-100 text-color-dark hover:bg-gray-200'
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
                                        {languages().length > 1 && (
                                            <button
                                                type="button"
                                                onClick={(e) => removeLanguage(e, index())}
                                                class="flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                                title="Supprimer cette langue"
                                            >
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </For>

                            {languages().length < SUPPORTED_LANGUAGES.length && (
                                <button
                                    type="button"
                                    onClick={(e) => addLanguage(e)}
                                    class="flex items-center justify-center w-8 h-8 rounded-full bg-color-main text-white hover:bg-color-secondary transition transform hover:scale-110"
                                    title="Ajouter une langue"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {languages()[selectedIndex()] ? (
                            <div class="dropdown dropdown-hover w-full">
                                <div 
                                    tabindex="0" 
                                    role="button" 
                                    class="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl bg-white hover:border-color-main transition cursor-pointer flex items-center gap-3"
                                >
                                    <span class={`fi fi-${LANGUAGE_TO_FLAG[languages()[selectedIndex()]]}`}></span>
                                    <span class="flex-1 text-left text-color-dark">
                                        {LANGUAGE_LABELS[languages()[selectedIndex()]]}
                                    </span>
                                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <ul 
                                    tabindex="0" 
                                    class="dropdown-content menu bg-white rounded-xl z-10 w-full p-2 shadow-xl border border-gray-200 max-h-60 overflow-y-auto"
                                >
                                    <For each={getAvailableLanguages(selectedIndex())}>
                                        {(lang) => (
                                            <li class="list-none">
                                                <a 
                                                    onClick={() => updateLanguage(selectedIndex(), lang as LanguageCode)}
                                                    class={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-color-light transition cursor-pointer text-color-dark no-underline ${
                                                        languages()[selectedIndex()] === lang 
                                                            ? 'bg-color-light text-color-main font-semibold' 
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
                                    class="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl bg-white hover:border-color-main transition cursor-pointer flex items-center gap-3"
                                >
                                    <span class="flex-1 text-left text-gray-400">Sélectionnez une langue</span>
                                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <ul 
                                    tabindex="0" 
                                    class="dropdown-content menu bg-white rounded-xl z-10 w-full p-2 shadow-xl border border-gray-200 max-h-60 overflow-y-auto"
                                >
                                    <For each={getAvailableLanguages(selectedIndex())}>
                                        {(lang) => (
                                            <li class="list-none">
                                                <a 
                                                    onClick={() => updateLanguage(selectedIndex(), lang as LanguageCode)}
                                                    class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-color-light transition cursor-pointer text-color-dark no-underline"
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

                    <div>
                        <label class="block text-color-dark font-semibold mb-3 text-lg">
                            Budget voyage
                        </label>
                        <div 
                            class="w-full"
                            style={{
                                '--range-color': getRangeColor(),
                                '--range-gradient': `linear-gradient(to right, ${getRangeColor()} 0%, ${getRangeColor()} ${((budgetLevel() - 1) / 2) * 100}%, #E5E7EB ${((budgetLevel() - 1) / 2) * 100}%, #E5E7EB 100%)`
                            }}
                        >
                            <input 
                                type="range" 
                                min="1" 
                                max="3" 
                                value={budgetLevel()} 
                                onInput={(e) => setBudgetLevel(Number(e.target.value))}
                                class="budget-range w-full" 
                                step="1"
                            />
                            <div class="flex justify-between mt-2">
                                <span class="text-xs font-bold" style={`color: ${budgetLevel() === 1 ? getRangeColor() : '#9CA3AF'}`}>|</span>
                                <span class="text-xs font-bold" style={`color: ${budgetLevel() === 2 ? getRangeColor() : '#9CA3AF'}`}>|</span>
                                <span class="text-xs font-bold" style={`color: ${budgetLevel() === 3 ? getRangeColor() : '#9CA3AF'}`}>|</span>
                            </div>
                            <div class="flex justify-between mt-2">
                                <div class="flex flex-col items-start">
                                    <span class="text-2xl font-bold mb-1" style={`color: ${budgetLevel() === 1 ? getRangeColor() : '#9CA3AF'}`}>
                                        {BUDGET_SYMBOLS[1]}
                                    </span>
                                    <span class="text-xs text-gray-600">{BUDGET_LABELS[1]}</span>
                                </div>
                                <div class="flex flex-col items-center">
                                    <span class="text-2xl font-bold mb-1" style={`color: ${budgetLevel() === 2 ? getRangeColor() : '#9CA3AF'}`}>
                                        {BUDGET_SYMBOLS[2]}
                                    </span>
                                    <span class="text-xs text-gray-600">{BUDGET_LABELS[2]}</span>
                                </div>
                                <div class="flex flex-col items-end">
                                    <span class="text-2xl font-bold mb-1" style={`color: ${budgetLevel() === 3 ? getRangeColor() : '#9CA3AF'}`}>
                                        {BUDGET_SYMBOLS[3]}
                                    </span>
                                    <span class="text-xs text-gray-600">{BUDGET_LABELS[3]}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-color-dark font-semibold mb-3 text-lg">
                            Mon style de voyage (minimum 3)
                        </label>
                        
                        {selectedTravelTypeSlugs().length > 0 && (
                            <div class="flex flex-wrap gap-2 mb-3">
                                <For each={selectedTravelTypeSlugs()}>
                                    {(slug) => {
                                        const tt = travelTypes().find(t => t.slug === slug);
                                        return (
                                            <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-color-secondary text-white text-sm font-medium">
                                                <span>{tt?.label}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTravelType(slug)}
                                                    class="flex items-center justify-center w-4 h-4 rounded-full hover:bg-white hover:bg-opacity-20 transition"
                                                >
                                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    }}
                                </For>
                            </div>
                        )}

                        <button
                            type="button"
                            onclick={() => myModalTravel?.showModal()}
                            class="w-full px-5 py-4 text-lg border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-color-main transition cursor-pointer flex items-center justify-center gap-2 text-gray-500 hover:text-color-main"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Choisir vos types de voyage</span>
                        </button>
                    </div>

                    <button
                        type="submit"
                        class="w-full bg-color-main text-white py-5 text-xl rounded-xl font-bold hover:bg-gradient-main transition-all duration-200 hover:scale-105 active:scale-95 mt-8"
                    >
                        Finir l'inscription
                    </button>
                </form>

                <dialog id="my_modal_travel" ref={myModalTravel} class="modal modal-bottom sm:modal-middle">
                    <div class="modal-box bg-white min-w-3/4 w-full">
                        <h3 class="text-2xl font-bold text-color-dark mb-4">
                            Sélectionnez vos types de voyage
                        </h3>
                        <div class="py-4 max-h-[32rem] overflow-y-auto pr-2">
                            <div class="flex flex-wrap gap-3">
                                <For each={travelTypes()}>
                                    {(tt) => (
                                        <button
                                            type="button"
                                            onClick={() => toggleTravelType(tt.slug)}
                                            class={`px-5 py-3 rounded-full text-base font-medium transition-all ${
                                                selectedTravelTypeSlugs().includes(tt.slug)
                                                    ? 'bg-color-secondary text-white border-2 border-color-secondary'
                                                    : 'border border-gray-300 bg-white text-color-dark hover:border-gray-400'
                                            }`}
                                        >
                                            {tt.label}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </div>
                        <div class="modal-action">
                            <form method="dialog">
                                <button class="btn bg-color-main text-white hover:bg-color-secondary border-none px-6 py-3">
                                    Fermer
                                </button>
                            </form>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    );
};

export default ContinueSignUp;