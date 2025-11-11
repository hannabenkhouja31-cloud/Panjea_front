import { Show } from "solid-js";
import type { UserProfileHeaderProps } from "./types";
import { getLocation } from "./utils";

export const UserProfileHeader = (props: UserProfileHeaderProps) => {

    return (
        <div class="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <div class="flex items-center gap-6">
                <div class="avatar avatar-placeholder">
                    <Show 
                        when={props.profile?.profilePictureUrl}
                        fallback={
                            <div class="bg-neutral text-neutral-content w-24 rounded-full">
                                <span class="text-4xl">
                                    {props.profile?.username?.[0]?.toUpperCase() || "P"}
                                </span>
                            </div>
                        }
                    >
                        <div class="w-24 rounded-full">
                            <img src={props.profile?.profilePictureUrl} alt={props.profile?.username} />
                        </div>
                    </Show>
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h1 class="text-3xl font-bold text-color-dark">{props.profile?.username}</h1>
                        <Show when={props.profile?.isVerified}>
                            <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                        </Show>
                    </div>
                    <p class="text-gray-600 mb-2">{getLocation(props.profile?.city, props.profile?.country)}</p>
                    <Show when={props.profile?.description}>
                        <p class="text-gray-700">{props.profile?.description}</p>
                    </Show>
                </div>
            </div>
            <Show when={props.currentUserId && props.userId !== props.currentUserId && !props.profile?.isDeleted && !props.profile?.isBanned}>
                <div class="mt-6 pt-6 border-t border-gray-100">
                    <Show 
                        when={props.reportStatus !== 'PENDING'}
                        fallback={
                            <button
                                disabled
                                class="text-sm text-gray-400 cursor-not-allowed flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Déjà signalé par vous
                            </button>
                        }
                    >
                        <button
                            onClick={props.onOpenReport}
                            class="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Signaler ce profil
                        </button>
                    </Show>
                </div>
            </Show>
            <Show when={props.profile?.isBanned}>
                <div class="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div class="flex items-center gap-2 text-red-700">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
                        </svg>
                        <span class="font-semibold">Ce compte a été banni</span>
                    </div>
                    <Show when={props.profile?.bannedReason}>
                        <p class="text-sm text-red-600 mt-2">Raison : {props.profile?.bannedReason}</p>
                    </Show>
                </div>
            </Show>
        </div>
    );
};