import { Show, For } from "solid-js";
import { Compass } from "lucide-solid";
import type { ProfileTravelTypesProps } from "./types";

export const ProfileTravelTypes = (props: ProfileTravelTypesProps) => {
    return (
        <div class="text-black border-l-2 sm:border-l-3 border-[#DC9E53] p-4 sm:p-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div class="p-1.5 sm:p-2 bg-color-secondary rounded-lg backdrop-blur-sm">
                    <Compass size={20} class="sm:w-6 sm:h-6" color="white" stroke-width={2.5}/>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-black">Type de voyage</h3>
            </div>
            <Show when={!props.isEditing}
                  fallback={
                      <div>
                          {props.editTravelTypes.length > 0 && (
                              <div class="flex flex-wrap gap-2 mb-3">
                                  <For each={props.editTravelTypes}>
                                      {(slug) => {
                                          const tt = props.allTravelTypes.find(t => t.slug === slug);
                                          return (
                                              <div class="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-black bg-color-secondary backdrop-blur-sm text-white text-xs sm:text-sm font-medium">
                                                  <span>{tt?.label}</span>
                                                  <Show when={props.editTravelTypes.length > 3}>
                                                      <button
                                                          type="button"
                                                          onClick={() => props.onToggleTravelType(slug)}
                                                          class="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full hover:bg-black/20 transition"
                                                      >
                                                          <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                          </svg>
                                                      </button>
                                                  </Show>
                                              </div>
                                          );
                                      }}
                                  </For>
                              </div>
                          )}
                          <button
                              type="button"
                              onclick={() => {
                                  const modal = document.getElementById('travel_types_modal') as HTMLDialogElement;
                                  modal?.showModal();
                              }}
                              class="w-full px-3 py-3 sm:px-5 sm:py-4 text-base sm:text-lg border-2 border-color-secondary rounded-xl text-black backdrop-blur-sm hover:border-black/50 hover:bg-black/20 transition cursor-pointer flex items-center justify-center gap-2 font-medium"
                          >
                              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                              </svg>
                              <span>Modifier les types de voyage</span>
                          </button>
                      </div>
                  }>
                <div class="flex gap-2 sm:gap-3 flex-wrap">
                    <Show when={props.travelTypes.length > 0}
                          fallback={<span class="text-black/60 italic text-base sm:text-lg">Aucun type de voyage renseigné</span>}>
                        <For each={props.travelTypes}>
                            {(type) => (
                                <span class="px-3 py-1.5 sm:px-5 sm:py-2.5 text-white bg-color-secondary backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                                    {type.label}
                                </span>
                            )}
                        </For>
                    </Show>
                </div>
            </Show>
        </div>
    );
};