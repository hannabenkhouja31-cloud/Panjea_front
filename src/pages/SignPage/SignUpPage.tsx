import { createSignal, onMount } from "solid-js";
import { A, useLocation, useNavigate } from "@solidjs/router";
import { Eye, EyeOff } from "lucide-solid";
import { backend } from "../../stores/configStore";
import { setRegisterEmail, setRegisterPassword } from "../../stores/userStore";

interface LocationState {
    fromBubble?: boolean;
    email?: string;
}

export const SignUpPage = () => {

    const navigate = useNavigate();
    const location = useLocation<LocationState>();

    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [error, setError] = createSignal("");
    const [showPassword, setShowPassword] = createSignal(false);
    const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
    const [bubbleMessage, setBubbleMessage] = createSignal(false);
    const [isEmailLocked, setIsEmailLocked] = createSignal(false); // 👈 NOUVEAU

    onMount(() => {
        if (location.state?.fromBubble) {
            setBubbleMessage(true);
            if (location.state?.email) {
                setEmail(location.state.email);
                setIsEmailLocked(true);
            }
        }
    });

    const handleSubmit = async (e: Event) => {

        e.preventDefault();
        setError("");

        if(!backend.isNeonReady) {
            setError("Attendez quelques secondes avant d'essayer de vous connecter.");
            return;
        }

        if (!email() || !password() || !confirmPassword()) {
            setError("Tous les champs sont requis");
            return;
        }

        if (password() !== confirmPassword()) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (password().length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
        if (!passwordRegex.test(password())) {
            setError("Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)");
            return;
        }

        setRegisterEmail(email());
        setRegisterPassword(password());
        navigate("/inscription/continuer")

    };

    return (
        <div class="py-40 flex-1 flex items-center justify-center bg-color-light">
            <div class="container-app-narrow">
                <div class="bg-white rounded-2xl shadow-xl py-10 px-6 sm:p-12 w-full">
                    <div class="text-center mb-10">
                        <h1 class="text-2xl sm:text-5xl font-bold text-color-dark mb-3">Créer un compte</h1>
                        <p class="text-gray-500 text-base sm:text-lg">Rejoignez la communauté Panjéa</p>
                    </div>

                    {bubbleMessage() && (
                        <div class="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl mb-8 text-base">
                            👋 Bienvenue ! Vous aviez déjà un compte sur l'ancienne version de Panjéa.
                            Veuillez créer un nouveau mot de passe pour finaliser la migration de votre compte.
                            {/* 👇 NOUVEAU MESSAGE */}
                            <br/><br/>
                            <strong>⚠️ Important :</strong> Vous devez utiliser l'adresse email ci-dessous (celle de votre ancien compte).
                        </div>
                    )}

                    {error() && (
                        <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 text-base">
                            {error()}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} class="space-y-6">
                        <div>
                            <label class="block text-color-dark font-semibold mb-3 sm:text-lg">Adresse email</label>
                            <input
                                type="email"
                                value={email()}
                                onInput={(e) => setEmail(e.target.value)}
                                disabled={isEmailLocked()}
                                class={`w-full px-2 sm:px-5 py-3 sm:py-4 text-sm sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition ${
                                    isEmailLocked() ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                                placeholder="exemple@email.com"
                                required
                            />
                            {isEmailLocked() && (
                                <p class="text-sm text-gray-600 mt-2">
                                    🔒 Cette adresse email est celle de votre ancien compte Panjéa et ne peut pas être modifiée.
                                </p>
                            )}
                        </div>

                        <div>
                            <label class="block text-color-dark font-semibold mb-3 sm:text-lg">Mot de passe</label>
                            <div class="relative">
                                <input
                                    type={showPassword() ? "text" : "password"}
                                    value={password()}
                                    onInput={(e) => setPassword(e.target.value)}
                                    class="w-full px-2 sm:px-5 py-3 sm:py-4 pr-12 text-sm sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition"
                                    placeholder="Minimum 8 caractères"
                                    required
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
                            class="w-full bg-color-main text-white py-3 sm:py-5 text-base sm:text-xl rounded-xl font-bold hover:bg-gradient-main transition-all duration-200 hover:scale-105 active:scale-95 mt-8"
                        >
                            S'inscrire
                        </button>
                    </form>

                    <p class="text-center text-sm sm:text-base text-gray-500 mt-8">
                        Vous avez déjà un compte ?{" "}
                        <A href="/connexion" class="text-color-main font-bold hover:underline">
                            Se connecter
                        </A>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;