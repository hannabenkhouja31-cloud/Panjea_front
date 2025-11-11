import { Show, type Accessor, type Setter } from "solid-js";
import { Users } from "lucide-solid";
import type { TripMember, PendingRequest } from "../types";
import { MembersList } from "./MembersList";
import { PendingRequestsList } from "./PendingRequestsList";
import { SimpleMembersList } from "./SimpleMembersList";

interface TripParticipantsProps {
    members: TripMember[];
    pendingRequests: PendingRequest[];
    isUserTrip: boolean;
    activeTab: Accessor<'members' | 'pending'>;
    setActiveTab: Setter<'members' | 'pending'>;
    onAcceptMember: (userId: string) => void;
    onDeclineMember: (userId: string) => void;
}

export const TripParticipants = (props: TripParticipantsProps) => {
    return (
        <div class="bg-white rounded-2xl shadow-md p-6">
            <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                <Users size={24} class="text-color-main" />
                Participants
                <Show when={props.members.length > 0}>
                    <span class="bg-color-main text-white text-sm px-3 py-1 rounded-full">
                        {props.members.length}
                    </span>
                </Show>
            </h2>

            <Show when={props.isUserTrip}>
                <div class="flex gap-2 border-b border-gray-200 mb-4">
                    <button
                        onClick={() => props.setActiveTab('members')}
                        class={`px-4 py-2 font-semibold transition-all ${
                            props.activeTab() === 'members'
                                ? 'text-color-main border-b-2 border-color-main'
                                : 'text-gray-500 hover:text-color-dark'
                        }`}
                    >
                        Membres ({props.members.length})
                    </button>
                    <button
                        onClick={() => props.setActiveTab('pending')}
                        class={`px-4 py-2 font-semibold transition-all relative ${
                            props.activeTab() === 'pending'
                                ? 'text-color-main border-b-2 border-color-main'
                                : 'text-gray-500 hover:text-color-dark'
                        }`}
                    >
                        Demandes ({props.pendingRequests.length})
                        <Show when={props.pendingRequests.length > 0}>
                            <span class="absolute -top-1 -right-1 w-2 h-2 bg-color-secondary rounded-full"></span>
                        </Show>
                    </button>
                </div>

                <Show when={props.activeTab() === 'members'}>
                    <MembersList members={props.members} />
                </Show>

                <Show when={props.activeTab() === 'pending'}>
                    <PendingRequestsList 
                        requests={props.pendingRequests}
                        onAccept={props.onAcceptMember}
                        onDecline={props.onDeclineMember}
                    />
                </Show>
            </Show>

            <Show when={!props.isUserTrip}>
                <SimpleMembersList members={props.members} />
            </Show>
        </div>
    );
};