import { createSignal, onMount } from "solid-js";
import { useSearchParams, useNavigate, A } from "@solidjs/router";
import { Eye, EyeOff, ArrowLeft } from "lucide-solid";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = createSignal("");
    const [newPassword, setNewPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal(false);
    const [isLoading, setIsLoading] = createSignal(false);
    const [isValidToken, setIsValidToken] = createSignal(false);
    const [isCheckingToken, setIsCheckingToken] = createSignal(true);
    const [showPassword, setShowPassword] = createSignal(false);
    const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);

    onMount(async () => {
        const tokenParam = searchParams.token;

        if (!tokenParam) {
            setError("Token manquant");
            setIsCheckingToken(false);
            return;
        }

        const tokenString = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
        setToken(tokenString);

        try {
            const response = await fetch(`${backendUrl}/password-reset/verify?token=${tokenString}`);
            const result = await response.json();

            if (result.success) {
                setIsValidToken(true);
            } else {
                setError("Ce lien de réinitialisation est invalide ou a expiré");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setIsCheckingToken(false);
        }
    });

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError("");

        if (!newPassword() || !confirmPassword()) {
            setError("Tous les champs sont requis");
            return;
        }

        if (newPassword() !== confirmPassword()) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (newPassword().length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
        if (!passwordRegex.test(newPassword())) {
            setError("Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${backendUrl}/password-reset/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token(),
                    newPassword: newPassword(),
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate("/connexion", { replace: true });
                }, 3000);
            } else {
                setError("Erreur lors de la réinitialisation du mot de passe");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div class="py-40 flex-1 flex items-center justify-center bg-color-light">
            <div class="container-app-narrow">
                <div class="bg-white rounded-2xl shadow-xl py-10 px-6 sm:p-12 w-full">
                    {isCheckingToken() ? (
                        <div class="text-center py-12">
                            <span class="loading loading-spinner loading-lg text-color-main"></span>
                            <p class="mt-4 text-gray-500">Vérification du lien...</p>
                        </div>
                    ) : !isValidToken() ? (
                        <>
                            <div class="text-center mb-8">
                                <h1 class="text-2xl sm:text-4xl font-bold text-color-dark mb-3">Lien invalide</h1>
                                <p class="text-gray-500 text-base sm:text-lg mb-8">{error()}</p>
                                <A href="/mot-de-passe-oublie" class="inline-block bg-color-main text-white px-8 py-3 rounded-xl font-semibold hover:bg-gradient-main transition">
                                    Demander un nouveau lien
                                </A>
                            </div>
                        </>
                    ) : success() ? (
                        <div class="text-center">
                            <div class="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl mb-6">
                                <p class="font-semibold mb-2">Mot de passe réinitialisé !</p>
                                <p>Tu vas être redirigé vers la page de connexion...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <A href="/connexion" class="inline-flex items-center gap-2 text-color-main hover:text-color-secondary transition mb-8">
                                <ArrowLeft size={20} />
                                <span>Retour à la connexion</span>
                            </A>

                            <div class="text-center mb-10">
                                <h1 class="text-2xl sm:text-5xl font-bold text-color-dark mb-3">Nouveau mot de passe</h1>
                                <p class="text-gray-500 text-base sm:text-lg">Choisis un nouveau mot de passe sécurisé</p>
                            </div>

                            {error() && (
                                <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 text-base">
                                    {error()}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} class="space-y-6">
                                <div>
                                    <label class="block text-color-dark font-semibold mb-3 sm:text-lg">Nouveau mot de passe</label>
                                    <div class="relative">
                                        <input
                                            type={showPassword() ? "text" : "password"}
                                            value={newPassword()}
                                            onInput={(e) => setNewPassword(e.target.value)}
                                            class="w-full px-2 sm:px-5 py-3 sm:py-4 pr-12 text-sm sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition"
                                            placeholder="Minimum 8 caractères"
                                            required
                                            disabled={isLoading()}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword())}
                                            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-color-main transition"
                                        >
                                            {showPassword() ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-color-dark font-semibold mb-3 sm:text-lg">Confirmer le mot de passe</label>
                                    <div class="relative">
                                        <input
                                            type={showConfirmPassword() ? "text" : "password"}
                                            value={confirmPassword()}
                                            onInput={(e) => setConfirmPassword(e.target.value)}
                                            class="w-full px-2 sm:px-5 py-3 sm:py-4 pr-12 text-sm sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition"
                                            placeholder="Retapez votre mot de passe"
                                            required
                                            disabled={isLoading()}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword())}
                                            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-color-main transition"
                                        >
                                            {showConfirmPassword() ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    class="w-full bg-color-main text-white py-3 sm:py-5 text-base sm:text-xl rounded-xl font-bold hover:bg-gradient-main transition-all duration-200 hover:scale-105 active:scale-95 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading()}
                                >
                                    {isLoading() ? "Réinitialisation..." : "Réinitialiser mon mot de passe"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;