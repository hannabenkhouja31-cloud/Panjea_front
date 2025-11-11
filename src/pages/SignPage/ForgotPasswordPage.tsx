import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { ArrowLeft } from "lucide-solid";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const ForgotPasswordPage = () => {
    const [email, setEmail] = createSignal("");
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal(false);
    const [isLoading, setIsLoading] = createSignal(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!email()) {
            setError("L'adresse email est requise");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${backendUrl}/password-reset/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email() }),
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                setError("Une erreur est survenue");
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
                <div class="bg-white rounded-2xl shadow-xl p-12 w-full">
                    <A href="/connexion" class="inline-flex items-center gap-2 text-color-main hover:text-color-secondary transition mb-8">
                        <ArrowLeft size={20} />
                        <span>Retour à la connexion</span>
                    </A>

                    <div class="text-center mb-10">
                        <h1 class="text-5xl font-bold text-color-dark mb-3">Mot de passe oublié ?</h1>
                        <p class="text-gray-500 text-lg">Pas de panique, on va t'aider à le récupérer</p>
                    </div>

                    {success() ? (
                        <div class="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl text-center">
                            <p class="font-semibold mb-2">Email envoyé !</p>
                            <p>Si un compte existe avec cette adresse, tu recevras un email avec les instructions pour réinitialiser ton mot de passe.</p>
                        </div>
                    ) : (
                        <>
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
                                        disabled={isLoading()}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    class="w-full bg-color-main text-white py-5 text-xl rounded-xl font-bold hover:bg-gradient-main transition-all duration-200 hover:scale-105 active:scale-95 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading()}
                                >
                                    {isLoading() ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;