import type { BudgetLevel, LanguageCode } from "../../models";
import type { UserProfile } from "../../stores/userStore";

export interface ProfileHeaderProps {
    profile: UserProfile | null;
    activeTab: string;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
}

export interface ProfileAvatarProps {
    profile: UserProfile | null;
    isEditing: boolean;
}

export interface ProfilePersonalInfoProps {
    profile: UserProfile | null;
    isEditing: boolean;
    editDescription: string;
    editCity: string;
    editCountry: string;
    editAge?: number;
    onDescriptionChange: (value: string) => void;
    onCityChange: (value: string) => void;
    onCountryChange: (value: string) => void;
    onAgeChange: (value: number | undefined) => void;
}

export interface ProfileTravelTypesProps {
    profile: UserProfile | null;
    isEditing: boolean;
    editTravelTypes: string[];
    allTravelTypes: Array<{ id: number; slug: string; label: string }>;
    travelTypes: Array<{ id: number; slug: string; label: string }>;
    onToggleTravelType: (slug: string) => void;
}

export interface ProfileBudgetProps {
    profile: UserProfile | null;
    isEditing: boolean;
    editBudgetLevel: BudgetLevel;
    onBudgetChange: (value: BudgetLevel) => void;
}

export interface ProfileLanguagesProps {
    languages: LanguageCode[];
    isEditing: boolean;
    editLanguages: LanguageCode[];
    selectedLanguageIndex: number;
    onSelectLanguageIndex: (index: number) => void;
    onAddLanguage: (e: MouseEvent) => void;
    onRemoveLanguage: (e: MouseEvent, index: number) => void;
    onUpdateLanguage: (index: number, lang: LanguageCode) => void;
    getAvailableLanguages: (index: number) => readonly string[];
}

export interface ProfileTripsProps {
    trips: any[];
}

export interface ProfileModalsProps {
    editTravelTypes: string[];
    allTravelTypes: any[];
    onToggleTravelType: (slug: string) => void;
    onConfirmSave: () => void;
    onConfirmDelete: () => void;
}