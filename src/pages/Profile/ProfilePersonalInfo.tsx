import { Show } from "solid-js";
import {UserCircle, MapPin, Cake} from "lucide-solid";
import type { ProfilePersonalInfoProps } from "./types";
import { capitalizeFirst, getLocation } from "./utils";

export const ProfilePersonalInfo = (props: ProfilePersonalInfoProps) => {
    return (
        <div class="text-black border-l-2 sm:border-l-3 border-[#146865] p-4 sm:p-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div class="p-1.5 sm:p-2 bg-color-main rounded-lg backdrop-blur-sm">
                    <UserCircle size={20} class="sm:w-6 sm:h-6" color="white" stroke-width={2.5}/>
                </div>
                <h3 class="text-lg sm:text-xl font-bold">Informations personnelles</h3>
            </div>
            <Show when={!props.isEditing}
                  fallback={
                      <div class="space-y-4 sm:space-y-5">
                          <div>
                              <label class="block text-xs sm:text-sm font-semibold text-black/90 mb-1 sm:mb-2">Description</label>
                              <textarea
                                  value={props.editDescription}
                                  onInput={(e) => props.onDescriptionChange(e.target.value)}
                                  placeholder="Parlez-nous de vous..."
                                  maxLength={512}
                                  class="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-black/30 rounded-xl bg-black/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition resize-none text-sm sm:text-base"
                                  rows={4}
                              />
                              <div class="text-right text-[10px] sm:text-xs text-black/70 mt-1">
                                  {props.editDescription.length}/512
                              </div>
                          </div>
                          <div>
                              <label class="block text-xs sm:text-sm font-semibold text-black/90 mb-1 sm:mb-2">Âge <span class="text-black/50 text-[10px] sm:text-xs font-normal">(optionnel)</span></label>
                              <input
                                  type="number"
                                  min="18"
                                  max="120"
                                  value={props.editAge ?? ""}
                                  onInput={(e) => props.onAgeChange(e.target.value ? Number(e.target.value) : undefined)}
                                  placeholder="Votre âge"
                                  class="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-black/30 rounded-xl bg-black/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition text-sm sm:text-base"
                              />
                          </div>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                  <label class="block text-xs sm:text-sm font-semibold text-black/90 mb-1 sm:mb-2">Ville</label>
                                  <input
                                      type="text"
                                      value={props.editCity}
                                      onInput={(e) => props.onCityChange(capitalizeFirst(e.target.value))}
                                      placeholder="Paris"
                                      maxLength={100}
                                      class="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-black/30 rounded-xl bg-black/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition text-sm sm:text-base"
                                  />
                              </div>
                              <div>
                                  <label class="block text-xs sm:text-sm font-semibold text-black/90 mb-1 sm:mb-2">Pays</label>
                                  <input
                                      type="text"
                                      value={props.editCountry}
                                      onInput={(e) => props.onCountryChange(capitalizeFirst(e.target.value))}
                                      placeholder="France"
                                      maxLength={100}
                                      class="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-black/30 rounded-xl bg-black/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition text-sm sm:text-base"
                                  />
                              </div>
                          </div>
                      </div>
                  }>
                <div class="space-y-3 sm:space-y-4">
                    <Show when={props.profile?.description}
                          fallback={<p class="text-black/60 italic text-base sm:text-lg">Aucune description</p>}>
                        <p class="text-black text-base sm:text-lg leading-relaxed font-light">{props.profile?.description}</p>
                    </Show>
                    <div class="flex items-center gap-2 sm:gap-3 pt-2">
                        <MapPin size={18} class="sm:w-5 sm:h-5" color="black" stroke-width={2.5}/>
                        <span class="text-black font-medium text-base sm:text-lg">{getLocation(props.profile?.city, props.profile?.country)}</span>
                    </div>
                    <Show when={props.profile?.age}>
                        <div class="flex items-center gap-2 sm:gap-3">
                            <Cake size={18} class="sm:w-5 sm:h-5" />
                            <span class="text-black font-medium text-base sm:text-lg">{props.profile?.age} ans</span>
                        </div>
                    </Show>
                </div>
            </Show>
        </div>
    );
};