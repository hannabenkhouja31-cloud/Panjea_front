import { createResource, Show } from "solid-js";
import { getUserFromDatabase } from "../../stores/userStore";

export const AskerUsername = (props: { askerId: string | undefined }) => {
    const getPseudoByAskerId = async (id: string) => {
        try {
            const { data } = await getUserFromDatabase(id);
            if (data?.isDeleted) {
                return "Utilisateur supprimé";
            }
            return data?.username || "Utilisateur";
        } catch (error) {
            console.error("Erreur getPseudoByAskerId:", error);
            return "Utilisateur";
        }
    };

    const [userPseudo] = createResource(() => props.askerId || null, getPseudoByAskerId);

    return (
        <Show when={!userPseudo.loading} fallback={<span>Utilisateur</span>}>
            {userPseudo()}
        </Show>
    );
};