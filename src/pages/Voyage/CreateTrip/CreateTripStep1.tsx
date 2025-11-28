import { For } from "solid-js";
import { Globe } from "lucide-solid";

interface CreateTripStep1Props {
    currentStep: number;
    title: string;
    destinationCountry: string;
    summary: string;
    setTitle: (value: string) => void;
    setDestinationCountry: (value: string) => void;
    setSummary: (value: string) => void;
}

const COUNTRIES = [
    "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda", "Arabie Saoudite", "Argentine",
    "Arménie", "Australie", "Autriche", "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize",
    "Bénin", "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie",
    "Burkina Faso", "Burundi", "Cambodge", "Cameroun", "Canada", "Cap-Vert", "Centrafrique", "Chili", "Chine", "Chypre",
    "Colombie", "Comores", "Congo", "Congo (RDC)", "Corée du Nord", "Corée du Sud", "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba",
    "Danemark", "Djibouti", "Dominique", "Égypte", "Émirats Arabes Unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini",
    "États-Unis", "Éthiopie", "Fidji", "Finlande", "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce",
    "Grenade", "Guatemala", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Guyana", "Haïti", "Honduras", "Hongrie", "Îles Marshall",
    "Îles Salomon", "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie", "Jamaïque",
    "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati", "Koweït", "Laos", "Lesotho", "Lettonie",
    "Liban", "Liberia", "Libye", "Liechtenstein", "Lituanie", "Luxembourg", "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi",
    "Maldives", "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco",
    "Mongolie", "Monténégro", "Mozambique", "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigeria", "Norvège",
    "Nouvelle-Zélande", "Oman", "Ouganda", "Ouzbékistan", "Pakistan", "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay",
    "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal", "Qatar", "Roumanie", "Royaume-Uni", "Russie", "Rwanda",
    "Saint-Christophe-et-Niévès", "Sainte-Lucie", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Samoa", "São Tomé-et-Príncipe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone",
    "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname",
    "Syrie", "Tadjikistan", "Tanzanie", "Tchad", "Tchéquie", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago",
    "Tunisie", "Turkménistan", "Turquie", "Tuvalu", "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela", "Vietnam",
    "Yémen", "Zambie", "Zimbabwe"
];

export const CreateTripStep1 = (props: CreateTripStep1Props) => {
    return (
        <div class="w-full max-w-2xl mx-auto">
            <div class="flex items-center justify-between mb-4 sm:mb-8">
                <div class="flex items-center gap-2 sm:gap-3">
                    <Globe class="w-6 h-6 sm:w-8 sm:h-8 text-color-main" />
                    <h3 class="text-xl sm:text-2xl font-bold text-color-dark">Nouveau voyage</h3>
                </div>
                <span class="text-sm sm:text-base text-gray-500 font-medium">Étape {props.currentStep}/5</span>
            </div>

            <div class="space-y-4 sm:space-y-6">
                <div>
                    <label class="block text-color-dark font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                        Titre du voyage *
                    </label>
                    <input
                        type="text"
                        value={props.title}
                        onInput={(e) => props.setTitle(e.target.value)}
                        class="w-full px-3 py-3 sm:px-5 sm:py-4 text-sm sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent bg-white text-color-dark"
                        placeholder="Ex: Aventure au Costa Rica"
                    />
                </div>

                <div>
                    <label class="block text-color-dark font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                        Pays de destination *
                    </label>
                    <select
                        value={props.destinationCountry}
                        onChange={(e) => props.setDestinationCountry(e.target.value)}
                        class="w-full px-3 py-3 sm:px-5 sm:py-4 text-sm sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent bg-white text-color-dark"
                    >
                        <option value="" disabled class="text-gray-400">Sélectionnez un pays</option>
                        <For each={COUNTRIES}>
                            {(country) => <option value={country} class="text-color-dark">{country}</option>}
                        </For>
                    </select>
                </div>

                <div>
                    <label class="block text-color-dark font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                        Résumé du voyage (optionnel)
                    </label>
                    <textarea
                        value={props.summary}
                        onInput={(e) => props.setSummary(e.target.value)}
                        class="w-full px-3 py-3 sm:px-5 sm:py-4 text-sm sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent resize-none bg-white text-color-dark"
                        rows={4}
                        placeholder="Décrivez votre voyage en quelques mots..."
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateTripStep1;