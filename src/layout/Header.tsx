import {A, useNavigate} from "@solidjs/router";
import {createSignal, onCleanup, onMount, Show, createMemo} from "solid-js";
import {closeDropdown, logout, setUserProfile, setUserTrips, toggleDropdown, user} from "../stores/userStore.ts";
import { style } from "../stores/styleStore.ts";
import {MessageCircle, User, LogOut, Menu, X, Home, Plane, Compass} from "lucide-solid";
import { getNeonApp } from "../stores/configStore.ts";
import { resetSocket } from "../stores/websocketStore.ts";
import { startLoading, stopLoading } from "../stores/loaderStore.ts";
import { getTotalUnreadCount, getUnansweredQuestionsCount } from "../stores/messagesStore.ts";

export const Header = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

    let dropdownRef: HTMLDivElement | undefined;
    let profileButtonRef: HTMLDivElement | undefined;
    let mobileMenuRef: HTMLDivElement | undefined;

    const unreadCount = createMemo(() => {
        if (!user.profile?.id) return 0;
        const messagesCount = getTotalUnreadCount(user.profile.id);
        const questionsCount = getUnansweredQuestionsCount(user.profile.id);
        return messagesCount + questionsCount;
    });

    const unreadDisplay = createMemo(() => {
        const count = unreadCount();
        if (count === 0) return null;
        if (count > 10) return '+10';
        return count.toString();
    });

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        
        const clickedMenuButton = target.closest('.mobile-menu-button');
        if (clickedMenuButton) return;
        
        if (dropdownRef && !dropdownRef.contains(target) &&
            profileButtonRef && !profileButtonRef.contains(target)) {
            closeDropdown();
        }
        
        if (mobileMenuRef && !mobileMenuRef.contains(target)) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = async () => {
        try {
            startLoading();
            closeDropdown();
            resetSocket();
            setUserProfile(null);
            setUserTrips([]);
            logout();
            
            const neonApp = getNeonApp();
            await (neonApp as any)?.signOut();
            
            navigate("/");
        } finally {
            stopLoading();
        }
    };

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
    });

    onCleanup(() => {
        document.removeEventListener("click", handleClickOutside);
    });

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div class="relative z-50 container-app pt-8 sm:pt-12 lg:pt-16 flex justify-between items-center">
            <div class="flex items-center gap-4 flex-1 lg:w-1/3">
                <A href="/"
                   onClick={closeMobileMenu}
                   class={style.isMenuWhite ? "text-white" : "text-black"}
                >
                    <img src="/logoMain.avif" class="w-16 h-16" alt="Panjéa"/>
                </A>
            </div>

            <nav class="hidden lg:flex w-1/3 text-xl items-center justify-center gap-8">
                <A href="/"
                   class={`${style.isMenuWhite ? "text-white" : "text-black"} active:scale-95 text-center transition-all duration-300 hover:scale-105 whitespace-nowrap`}
                >
                    Accueil
                </A>
                <A href="/voyage"
                   class={`${style.isMenuWhite ? "text-white" : "text-black"} active:scale-95 text-center transition-all duration-300 hover:scale-105 whitespace-nowrap`}
                >
                    Voyage
                </A>
                <A href="/"
                   class={`${style.isMenuWhite ? "text-white" : "text-black"} active:scale-95 text-center transition-all duration-300 hover:scale-105 whitespace-nowrap`}
                >
                    Découvrir
                </A>
            </nav>

            <div class="flex items-center justify-end gap-3 sm:gap-4 flex-1 lg:w-1/3">
                <Show when={!user.isConnected}
                      fallback={
                          <div class="relative">
                                <div ref={profileButtonRef}
                                    onClick={toggleDropdown}
                                    class="cursor-pointer avatar avatar-placeholder relative">
                                    <Show 
                                        when={user.profile?.profilePictureUrl}
                                        fallback={
                                            <div class="bg-neutral text-neutral-content w-10 sm:w-12 lg:w-14 rounded-full">
                                                <span class="text-xl sm:text-2xl lg:text-3xl">{user.profile?.username?.[0]?.toUpperCase() || "P"}</span>
                                            </div>
                                        }
                                    >
                                        <div class="w-10 sm:w-12 lg:w-14 rounded-full">
                                            <img src={user.profile?.profilePictureUrl} alt={user.profile?.username} />
                                        </div>
                                    </Show>
                                    <Show when={unreadDisplay()}>
                                        <div class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-color-secondary rounded-full flex items-center justify-center">
                                            <span class="text-white text-xs font-bold">{unreadDisplay()}</span>
                                        </div>
                                    </Show>
                                </div>
                              <Show when={user.isDropdownOpen}>
                                  <div ref={dropdownRef}
                                       class="absolute right-0 top-12 sm:top-14 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                      <div class="py-1">
                                          <div class="lg:hidden">
                                              <A href="/"
                                                 onClick={closeDropdown}
                                                 class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                                                  <Home size={20} color="#374151"/>
                                                  <span class="text-sm font-medium">Accueil</span>
                                              </A>
                                              <A href="/voyage"
                                                 onClick={closeDropdown}
                                                 class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                                                  <Plane size={20} color="#374151"/>
                                                  <span class="text-sm font-medium">Voyage</span>
                                              </A>
                                              <A href="/"
                                                 onClick={closeDropdown}
                                                 class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                                                  <Compass size={20} color="#374151"/>
                                                  <span class="text-sm font-medium">Découvrir</span>
                                              </A>
                                              <div class="border-t border-gray-100 my-1"></div>
                                          </div>
                                          
                                          <button onClick={() => {
                                              closeDropdown();
                                              navigate("/profile", { replace: false });
                                          }}
                                                  class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                                              <User size={20} color="#374151"/>
                                              <span class="text-sm font-medium">Mon profil</span>
                                          </button>
                                          <button onClick={() => {
                                              closeDropdown();
                                              navigate("/conversations", { replace: false });
                                          }}
                                                  class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150 relative">
                                              <MessageCircle size={20} color="#374151"/>
                                              <span class="text-sm font-medium">Messages</span>
                                              <Show when={unreadDisplay()}>
                                                <div class="ml-auto min-w-[20px] h-5 px-1.5 bg-color-secondary rounded-full flex items-center justify-center">
                                                    <span class="text-white text-xs font-bold">{unreadDisplay()}</span>
                                                </div>
                                              </Show>
                                          </button>
                                          
                                          <Show when={user.profile?.isAdmin}>
                                              <button onClick={() => {
                                                  closeDropdown();
                                                  navigate("/admin", { replace: false });
                                              }}
                                                      class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                  </svg>
                                                  <span class="text-sm font-medium">Administration</span>
                                              </button>
                                          </Show>
                                          
                                          {/*<button onClick={closeDropdown}
                                                  class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                                              <Settings size={20} color="#374151"/>
                                              <span class="text-sm font-medium">Paramètres</span>
                                          </button>*/}
                                          <div class="border-t border-gray-100 mt-1 mb-1"></div>
                                          <button onClick={handleLogout}
                                                class="w-full px-4 py-3 text-left text-red-400 hover:bg-red-50 flex items-center gap-3 transition-colors duration-150">
                                                <LogOut size={18} color="#f87171"/>
                                                <span class="text-sm font-medium">Déconnexion</span>
                                          </button>
                                      </div>
                                  </div>
                              </Show>
                          </div>
                      }
                >
                    <div
                        class={`hidden sm:block font-semibold p-2 sm:p-3 transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base ${style.isMenuWhite ? "text-white" : "text-black"}`}>
                        <A href="/inscription">
                            S'inscrire
                        </A>
                    </div>
                    <A href="/connexion"
                       class="btn-secondary text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-3 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap">
                        Se connecter
                    </A>

                    <button
                        class={`lg:hidden mobile-menu-button p-2 ${style.isMenuWhite ? "text-white" : "text-black"}`}
                        onClick={() => {
                            setTimeout(() => setIsMobileMenuOpen(!isMobileMenuOpen()), 0);
                        }}
                    >
                        <Show when={!isMobileMenuOpen()} fallback={<X size={24} />}>
                            <Menu size={24} />
                        </Show>
                    </button>
                </Show>
            </div>

            <Show when={isMobileMenuOpen() && !user.isConnected}>
                <div ref={mobileMenuRef}
                     class="lg:hidden absolute top-full left-0 right-0 mt-4 mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div class="py-2">
                        <A href="/"
                           onClick={closeMobileMenu}
                           class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                            <Home size={20} color="#374151"/>
                            <span class="text-sm font-medium">Accueil</span>
                        </A>
                        <A href="/voyage"
                           onClick={closeMobileMenu}
                           class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                            <Plane size={20} color="#374151"/>
                            <span class="text-sm font-medium">Voyage</span>
                        </A>
                        <A href="/"
                           onClick={closeMobileMenu}
                           class="w-full px-4 py-3 text-left text-color-dark hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                            <Compass size={20} color="#374151"/>
                            <span class="text-sm font-medium">Découvrir</span>
                        </A>
                        
                        <div class="border-t border-gray-100 mt-2 mb-2 sm:hidden"></div>
                        <A href="/inscription"
                           onClick={closeMobileMenu}
                           class="sm:hidden w-full px-4 py-3 text-left text-color-main hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150">
                            <User size={20} color="#146865"/>
                            <span class="text-sm font-medium">S'inscrire</span>
                        </A>
                    </div>
                </div>
            </Show>
        </div>
    )
}