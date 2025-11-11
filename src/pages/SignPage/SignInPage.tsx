import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { Eye, EyeOff } from "lucide-solid";
import { backend, getNeonApp } from "../../stores/configStore";
import { getUserFromDatabase, getUserTripsFromDatabase, login, setUserProfile, setUserTrips } from "../../stores/userStore";
import { startLoading, stopLoading } from "../../stores/loaderStore";
import { getAllTrips } from "../../stores/tripStore";

export const SignInPage = () => {

    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [error, setError] = createSignal("");
    const [showPassword, setShowPassword] = createSignal(false);

    const handleSubmit = async (e: Event) => {

        e.preventDefault();
        setError("");

        startLoading();

        if(!backend.isNeonReady) {
            setError("Attendez quelques secondes avant d'essayer de vous connecter.");
            stopLoading();
            return;
        }

        const neonApp = getNeonApp();

        if (!email() || !password()) {
            setError("Tous les champs sont requis");
            stopLoading();
            return;
        }

        try {

            const result = await neonApp?.signInWithCredential({
                email: email(),
                password: password(),
            });

            if (result?.status === 'error') {
                setError(`Connexion échouée: ${result.error.humanReadableMessage}`);
                stopLoading();
                return;
            }

            const neonUser = await neonApp?.getUser();
            if (!neonUser?.id) {
                setError("Erreur lors de la récupération de l'utilisateur");
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
            window.location.href = "/voyage"; 
            
        } catch (err) {
            setError("Erreur de connexion au serveur");
            stopLoading();
        }
    };

    return (
        <div class="py-40 flex-1 flex items-center justify-center bg-color-light">
            <div class="container-app-narrow">
                <div class="bg-white rounded-2xl shadow-xl p-12 w-full">
                    <div class="text-center mb-10">
                        <h1 class="text-5xl font-bold text-color-dark mb-3">Se connecter</h1>
                        <p class="text-gray-500 text-lg">Bon retour sur Panjéa</p>
                    </div>

                    {error() && (
                        <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 text-base">
                            {error()}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} class="space-y-6">
                        <div>
                            <label class="block text-color-dark font-semibold mb-3 text-lg">Adresse email</label>
                            <input
                                type="email"
                                value={email()}
                                onInput={(e) => setEmail(e.target.value)}
                                class="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition"
                                placeholder="exemple@email.com"
                                required
                            />
                        </div>

                        <div>
                            <div class="relative">
                                <div class="flex items-center justify-between mb-3">
                                <label class="block text-color-dark font-semibold text-lg">Mot de passe</label>
                            </div>
                                <input
                                    type={showPassword() ? "text" : "password"}
                                    value={password()}
                                    onInput={(e) => setPassword(e.target.value)}
                                    class="w-full px-5 py-4 pr-12 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition"
                                    placeholder="Votre mot de passe"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword())}
                                    class="absolute right-4 top-16 text-gray-500 hover:text-color-main transition"
                                >
                                    {showPassword() ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div class="mt-1 flex items-center justify-between mb-3">
                                <label class="block text-color-dark font-semibold text-lg"></label>
                                <A href="/mot-de-passe-oublie" class="text-sm text-color-main hover:underline">
                                    Mot de passe oublié ?
                                </A>
                            </div>
                        </div>

                        <button
                            type="submit"
                            class="w-full bg-color-main text-white py-5 text-xl rounded-xl font-bold hover:bg-gradient-main transition-all duration-200 hover:scale-105 active:scale-95 mt-8"
                        >
                            Se connecter
                        </button>
                    </form>

                    <p class="text-center text-base text-gray-500 mt-8">
                        Vous n'avez pas de compte ?{" "}
                        <A href="/inscription" class="text-color-main font-bold hover:underline">
                            S'inscrire
                        </A>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;