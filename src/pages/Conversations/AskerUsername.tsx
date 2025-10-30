import { createResource, Show } from "solid-js";
import { getUserFromDatabase } from "../../stores/userStore";

export const AskerUsername = (props: { askerId: string | undefined }) => {
    

    const getPseudoByAskerId = async (id:string) => {
        try{
            const { data } = await getUserFromDatabase(id);
            return data.username;
        } catch(error) {
            console.error("Erreur getPseudoByAskerId:", error);
            return "Utilisateur inconnu";
        }
            
    }

    const [userPseudo] = createResource(()=>props.askerId || null, getPseudoByAskerId);
    
    return(
        <Show 
            when={!userPseudo.loading} 
            fallback={<span class="opacity-70">Utilisateur</span>}
        >
            <span>{userPseudo() || ' Utilisateur'}</span>
        </Show>
        
    )
}