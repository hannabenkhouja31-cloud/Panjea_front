import { createSignal, onMount, Show, createEffect } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { SUPPORTED_LANGUAGES, type BudgetLevel, type LanguageCode } from "../../models";
import { deleteAccount, updateProfile, user } from "../../stores/userStore";
import { backend } from "../../stores/configStore";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePersonalInfo } from "./ProfilePersonalInfo";
import { ProfileTravelTypes } from "./ProfileTravelTypes";
import { ProfileBudget } from "./ProfileBudget";
import { ProfileLanguages } from "./ProfileLanguages";
import { ProfileTrips } from "./ProfileTrips";
import { ProfileModals } from "./ProfileModals";

export const ProfilePage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [verificationMessage, setVerificationMessage] = createSignal<{text: string, type: 'success' | 'error'} | null>(null);

    onMount(() => {
        if(!user.isConnected){
            navigate("/", { replace: true });
            return;
        }

        const verification = searchParams.verification;
        
        if (verification === 'success') {
            setVerificationMessage({
                text: '✅ Ton email a été vérifié avec succès !',
                type: 'success'
            });
            setTimeout(() => {
                setSearchParams({ verification: undefined });
                setVerificationMessage(null);
            }, 5000);
        } else if (verification === 'expired') {
            setVerificationMessage({
                text: '❌ Le lien de vérification a expiré',
                type: 'error'
            });
            setTimeout(() => {
                setSearchParams({ verification: undefined });
                setVerificationMessage(null);
            }, 5000);
        } else if (verification === 'invalid') {
            setVerificationMessage({
                text: '❌ Le lien de vérification est invalide',
                type: 'error'
            });
            setTimeout(() => {
                setSearchParams({ verification: undefined });
                setVerificationMessage(null);
            }, 5000);
        }
    });

    const [activeTab, setActiveTab] = createSignal("about");
    const [isEditing, setIsEditing] = createSignal(false);
    const [hasChanges, setHasChanges] = createSignal(false);

    const [editLanguages, setEditLanguages] = createSignal<LanguageCode[]>([]);
    const [editDescription, setEditDescription] = createSignal("");
    const [editCity, setEditCity] = createSignal("");
    const [editCountry, setEditCountry] = createSignal("");
    const [selectedLanguageIndex, setSelectedLanguageIndex] = createSignal(0);
    const [editBudgetLevel, setEditBudgetLevel] = createSignal<BudgetLevel | number>(1);
    const [editTravelTypes, setEditTravelTypes] = createSignal<string[]>([]);

    createEffect(() => {
                if (!user.isConnected) {
                    navigate("/inscription", { replace: true });
                }
    });

    createEffect(() => {
        if (isEditing()) {
            setEditLanguages([...(user.profile?.languages || [])]);
            setEditBudgetLevel(user.profile?.budgetLevel || 1);
            setEditTravelTypes(
                [...(user.profile?.travelTypes || [])]
            );
            setEditDescription(user.profile?.description || "");
            setEditCity(user.profile?.city || "");
            setEditCountry(user.profile?.country || "");
        }
    });

    createEffect(() => {
        if (isEditing()) {
            const languagesChanged = JSON.stringify(editLanguages()) !== JSON.stringify(user.profile?.languages);
            const budgetChanged = editBudgetLevel() !== user.profile?.budgetLevel;
            const travelTypesChanged = JSON.stringify(editTravelTypes()) !== JSON.stringify(user.profile?.travelTypes);
            const descriptionChanged = editDescription() !== (user.profile?.description || "");
            const cityChanged = editCity() !== (user.profile?.city || "");
            const countryChanged = editCountry() !== (user.profile?.country || "");
            
            setHasChanges(languagesChanged || budgetChanged || travelTypesChanged || descriptionChanged || cityChanged || countryChanged);
        } else {
            setHasChanges(false);
        }
    });

    const travelTypes = () => {
        if (!backend.travelTypes || !user.profile?.travelTypes) return [];
        return backend.travelTypes.filter(tt => 
            user.profile?.travelTypes.includes(tt.slug as any)
        );
    };

    const addLanguage = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const availableLanguages = SUPPORTED_LANGUAGES.filter(
            lang => !editLanguages().includes(lang as LanguageCode)
        );
        
        if (availableLanguages.length > 0) {
            const currentLangs = editLanguages();
            setEditLanguages([...currentLangs, null as any]);
            setSelectedLanguageIndex(currentLangs.length);
        }
    };

    const removeLanguage = (e: MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (editLanguages().length > 1) {
            const newLanguages = editLanguages().filter((_, i) => i !== index);
            setEditLanguages(newLanguages);
            if (selectedLanguageIndex() >= newLanguages.length) {
                setSelectedLanguageIndex(Math.max(0, newLanguages.length - 1));
            } else if (selectedLanguageIndex() === index) {
                setSelectedLanguageIndex(0);
            }
        }
    };

    const updateLanguage = (index: number, newLang: LanguageCode) => {
        const newLanguages = [...editLanguages()];
        newLanguages[index] = newLang;
        setEditLanguages(newLanguages);
    };

    const getAvailableLanguages = (currentIndex: number) => {
        const currentLang = editLanguages()[currentIndex];
        return SUPPORTED_LANGUAGES.filter(
            lang => !editLanguages().includes(lang as LanguageCode) || currentLang === lang
        );
    };

    const allTravelTypes = () => {
        if (!backend.travelTypes) return [];
        if (Array.isArray(backend.travelTypes)) return backend.travelTypes;
        return [];
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

    const handleSave = () => {
        const modal = document.getElementById('confirm_save_modal') as HTMLDialogElement;
        modal?.showModal();
    };

    const confirmSave = async () => {
        const updateData = {
            languages: editLanguages(),
            budgetLevel: editBudgetLevel() as BudgetLevel,
            travelTypes: editTravelTypes(),
            description: editDescription(),
            city: editCity(),
            country: editCountry()
        };
        
        const result = await updateProfile(updateData);
        
        if (result.success) {
            setIsEditing(false);
            setHasChanges(false);
        } else {
            console.error("Erreur lors de la sauvegarde:", result.error);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setHasChanges(false);
    };

    const handleDeleteAccount = () => {
        const modal = document.getElementById('confirm_delete_modal') as HTMLDialogElement;
        modal?.showModal();
    };

    const confirmDelete = async () => {
        const result = await deleteAccount();
        
        if (result.success) {
            navigate("/", { replace: true });
        } else {
            console.error("Erreur lors de la suppression:", result.error);
        }
    };

    return (
        <div class="flex-1 bg-color-light">
            <div class="container-app py-12">
                <Show when={verificationMessage()}>
                    <div class={`mb-6 p-4 rounded-xl font-semibold text-center ${
                        verificationMessage()?.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-700' 
                            : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                        {verificationMessage()?.text}
                    </div>
                </Show>

                <ProfileHeader 
                    profile={user.profile}
                    activeTab={activeTab()}
                    isEditing={isEditing()}
                    onEdit={() => setIsEditing(true)}
                    onCancel={cancelEdit}
                />

                <div class="bg-white rounded-2xl shadow-sm">
                    <div class="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("about")}
                            class={`flex-1 py-4 px-6 text-center font-semibold ${
                                activeTab() === "about"
                                    ? "text-color-main border-b-3"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            À propos
                        </button>
                        <button
                            onClick={() => setActiveTab("trips")}
                            class={`flex-1 py-4 px-6 text-center font-semibold ${
                                activeTab() === "trips"
                                    ? "text-color-main border-b-3"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Voyages ({user.trips.length})
                        </button>
                    </div>

                    <div class="p-8">
                        <Show when={activeTab() === "about"}>
                            <div class="space-y-12">
                                <ProfilePersonalInfo 
                                    profile={user.profile}
                                    isEditing={isEditing()}
                                    editDescription={editDescription()}
                                    editCity={editCity()}
                                    editCountry={editCountry()}
                                    onDescriptionChange={setEditDescription}
                                    onCityChange={setEditCity}
                                    onCountryChange={setEditCountry}
                                />

                                <ProfileTravelTypes 
                                    profile={user.profile}
                                    isEditing={isEditing()}
                                    editTravelTypes={editTravelTypes()}
                                    allTravelTypes={allTravelTypes()}
                                    travelTypes={travelTypes()}
                                    onToggleTravelType={toggleTravelType}
                                />

                                <ProfileBudget 
                                    profile={user.profile}
                                    isEditing={isEditing()}
                                    editBudgetLevel={editBudgetLevel() as BudgetLevel}
                                    onBudgetChange={setEditBudgetLevel}
                                />

                                <ProfileLanguages 
                                    languages={user.profile?.languages || []}
                                    isEditing={isEditing()}
                                    editLanguages={editLanguages()}
                                    selectedLanguageIndex={selectedLanguageIndex()}
                                    onSelectLanguageIndex={setSelectedLanguageIndex}
                                    onAddLanguage={addLanguage}
                                    onRemoveLanguage={removeLanguage}
                                    onUpdateLanguage={updateLanguage}
                                    getAvailableLanguages={getAvailableLanguages}
                                />

                                <Show when={isEditing()}>
                                    <div class="flex gap-4 pt-4">
                                        <button
                                            onClick={cancelEdit}
                                            class="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!hasChanges()}
                                            class={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                                hasChanges() 
                                                    ? 'bg-color-main text-white hover:scale-105 cursor-pointer' 
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Sauvegarder les modifications
                                        </button>
                                    </div>

                                    <div class="flex justify-center items-center pt-8 border-t border-gray-200 mt-8">
                                        <button
                                            onClick={handleDeleteAccount}
                                            class="text-center text-sm text-black/20 hover:text-black/40"
                                        >
                                            Supprimer mon compte
                                        </button>
                                    </div>
                                </Show>
                            </div>
                        </Show>

                        <Show when={activeTab() === "trips"}>
                            <ProfileTrips trips={user.trips} />
                        </Show>
                    </div>
                </div>
            </div>

            <ProfileModals 
                editTravelTypes={editTravelTypes()}
                allTravelTypes={allTravelTypes()}
                onToggleTravelType={toggleTravelType}
                onConfirmSave={confirmSave}
                onConfirmDelete={confirmDelete}
            />
        </div>
    );
};

export default ProfilePage;