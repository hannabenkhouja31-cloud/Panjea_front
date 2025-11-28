import { Show } from "solid-js";
import { MapPin } from "lucide-solid";
import { ProfileAvatar } from "./ProfileAvatar";
import type { ProfileHeaderProps } from "../types";
import { getLocation } from "../utils";

export const ProfileHeader = (props: ProfileHeaderProps) => {
    return (
        <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full">
                    <ProfileAvatar profile={props.profile} isEditing={props.isEditing} />
                    <div class="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <h1 class="text-2xl sm:text-3xl font-bold text-color-dark break-all">{props.profile?.username}</h1>
                            <Show when={props.profile?.isVerified}>
                                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                            </Show>
                        </div>
                        <div class="flex items-center gap-1.5 sm:gap-2 text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">
                            <MapPin size={16} class="sm:w-[18px] sm:h-[18px]" color="#DC9E53"/>
                            <span>{getLocation(props.profile?.city, props.profile?.country)}</span>
                        </div>
                        <Show when={props.profile?.description}>
                            <p class="text-gray-700 text-sm sm:text-base max-w-md">{props.profile?.description}</p>
                        </Show>
                    </div>
                </div>
                <Show when={props.activeTab === "about"}>
                    <div class="w-full sm:w-auto mt-2 sm:mt-0">
                        <Show when={!props.isEditing}
                              fallback={
                                  <button
                                      onClick={props.onCancel}
                                      class="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
                                  >
                                      Annuler
                                  </button>
                              }>
                            <button
                                onClick={props.onEdit}
                                class="w-full sm:w-auto bg-color-main text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                            >
                                Modifier
                            </button>
                        </Show>
                    </div>
                </Show>
            </div>
        </div>
    );
};