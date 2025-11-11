import { createSignal } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { Eye, EyeOff } from "lucide-solid";
import { backend } from "../../stores/configStore";
import { setRegisterEmail, setRegisterPassword } from "../../stores/userStore";

export const SignUpPage = () => {

    const navigate = useNavigate();

    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [error, setError] = createSignal("");
    const [showPassword, setShowPassword] = createSignal(false);
    const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);

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
                <div class="bg-white rounded-2xl shadow-xl p-12 w-full">
                    <div class="text-center mb-10">
                        <h1 class="text-5xl font-bold text-color-dark mb-3">Créer un compte</h1>
                        <p class="text-gray-500 text-lg">Rejoignez la communauté Panjéa</p>
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
                            <label class="block text-color-dark font-semibold mb-3 text-lg">Mot de passe</label>
                            <div class="relative">
                                <input
                                    type={showPassword() ? "text" : "password"}
                                    value={password()}
                                    onInput={(e) => setPassword(e.target.value)}
                                    class="w-full px-5 py-4 pr-12 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition"
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
                            <label class="block text-color-dark font-semibold mb-3 text-lg">Confirmer le mot de passe</label>
                            <div class="relative">
                                <input
                                    type={showConfirmPassword() ? "text" : "password"}
                                    value={confirmPassword()}
                                    onInput={(e) => setConfirmPassword(e.target.value)}
                                    class="w-full px-5 py-4 pr-12 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-main focus:border-transparent transition"
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
                            class="w-full bg-color-main text-white py-5 text-xl rounded-xl font-bold hover:bg-gradient-main transition-all duration-200 hover:scale-105 active:scale-95 mt-8"
                        >
                            S'inscrire
                        </button>
                    </form>

                    <p class="text-center text-base text-gray-500 mt-8">
                        Vous avez déjà un compte ?{" "}
                        <A href="/" class="text-color-main font-bold hover:underline">
                            Se connecter
                        </A>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;