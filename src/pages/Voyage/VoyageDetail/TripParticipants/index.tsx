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
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6">
            <h2 class="text-lg sm:text-xl font-bold text-color-dark flex items-center gap-2 mb-3 sm:mb-4">
                <Users size={20} class="sm:w-6 sm:h-6 text-color-main" />
                Participants
                <Show when={props.members.length > 0}>
                    <span class="bg-color-main text-white text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                        {props.members.length}
                    </span>
                </Show>
            </h2>

            <Show when={props.isUserTrip}>
                <div class="flex gap-1 sm:gap-2 border-b border-gray-200 mb-3 sm:mb-4 overflow-x-auto">
                    <button
                        onClick={() => props.setActiveTab('members')}
                        class={`px-3 py-2 sm:px-4 font-semibold transition-all text-sm sm:text-base whitespace-nowrap ${
                            props.activeTab() === 'members'
                                ? 'text-color-main border-b-2 border-color-main'
                                : 'text-gray-500 hover:text-color-dark'
                        }`}
                    >
                        Membres ({props.members.length})
                    </button>
                    <button
                        onClick={() => props.setActiveTab('pending')}
                        class={`px-3 py-2 sm:px-4 font-semibold transition-all relative text-sm sm:text-base whitespace-nowrap ${
                            props.activeTab() === 'pending'
                                ? 'text-color-main border-b-2 border-color-main'
                                : 'text-gray-500 hover:text-color-dark'
                        }`}
                    >
                        Demandes ({props.pendingRequests.length})
                        <Show when={props.pendingRequests.length > 0}>
                            <span class="absolute top-1 right-0 sm:-top-1 sm:-right-1 w-2 h-2 bg-color-secondary rounded-full"></span>
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