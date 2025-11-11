import { Show } from "solid-js";
import { MessageSquare } from "lucide-solid";
import { useNavigate } from "@solidjs/router";
import type { Message } from "../types";
import type { Trip } from "../../../models";
import { user } from "../../../stores/userStore";

interface JoinRequestMessageProps {
    message: Message;
    trip: Trip;
    isUserTrip: boolean;
}

export const JoinRequestMessage = (props: JoinRequestMessageProps) => {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    return (
        <div class="my-4 flex justify-center w-full">
            <div class="w-full max-w-lg p-4 bg-white border-2 border-color-secondary rounded-xl">
                <div class="flex items-start gap-3">
                    <div 
                        onClick={() => {
                            if (props.message.sender.username !== 'Utilisateur supprimé') {
                                navigate(`/user/${props.message.sender.id}`);
                            }
                        }}
                        class={`w-10 h-10 rounded-full bg-black border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden ${
                            props.message.sender.username === 'Utilisateur supprimé' ? 'cursor-default' : 'cursor-pointer'
                        }`}
                    >
                        <Show 
                            when={props.message.sender.profilePictureUrl}
                            fallback={
                                <span class="text-white font-bold text-lg">
                                    {props.message.sender.username[0].toUpperCase()}
                                </span>
                            }
                        >
                            <img 
                                src={props.message.sender.profilePictureUrl} 
                                alt={props.message.sender.username}
                                class="w-full h-full object-cover"
                            />
                        </Show>
                    </div>
                    
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <MessageSquare size={16} class="text-color-secondary" />
                            <span class="text-sm font-semibold text-color-secondary">
                                Demande de participation
                            </span>
                        </div>
                        <p class="text-color-dark mb-3">{props.message.content}</p>
                        <Show when={props.isUserTrip}>
                            <div class="flex gap-2 w-full">
                                <button
                                    onClick={async () => {
                                        await fetch(`${backendUrl}/trip-members/${props.trip.id}/accept/${props.message.sender.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ 
                                                organizerId: user.profile?.id,
                                                messageId: props.message.id
                                            })
                                        });
                                    }}
                                    class="flex-1 bg-color-main text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                                >
                                    Accepter
                                </button>
                                <button
                                    onClick={async () => {
                                        await fetch(`${backendUrl}/trip-members/${props.trip.id}/decline/${props.message.sender.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ 
                                                organizerId: user.profile?.id,
                                                messageId: props.message.id
                                            })
                                        });
                                    }}
                                    class="flex-1 bg-color-secondary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                                >
                                    Décliner
                                </button>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    );
};