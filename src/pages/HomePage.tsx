import { A } from "@solidjs/router";
import {DownDollarIcon, FemaleGenderIcon, PeaceIcon, ShieldIcon} from "../assets/images/icons.tsx";
import { Show } from "solid-js";
import { user } from "../stores/userStore.ts";

export const HomePage = () => {
    return (
            <div class="pb-16 md:pb-32 bg-color-light">
                <div class="w-full pt-32 md:pt-64 pb-16 md:pb-32 relative z-0 md:bottom-32 text-white bg-gradient-main flex flex-col justify-center items-center">
                    <div class="container-app flex flex-col items-center justify-center">
                        <h1 class="font-bold text-3xl sm:text-4xl md:text-5xl text-center px-4">Réinventons le voyage entre femmes.</h1>
                        <h2 class="mt-4 font-medium text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-[776px] text-center mx-auto px-4">Décide de comment voyager et avec qui partager des moments uniques en toute sérénité</h2>
                        <Show when={!user.isConnected} fallback={<>
                                                    <A href="/voyage" class="cursor-pointer mt-6 md:mt-8 btn-secondary text-lg md:text-xl">Rejoins notre communauté</A>
                          </>}>
                          <A href="/inscription" class="cursor-pointer mt-6 md:mt-8 btn-secondary text-lg md:text-xl">Rejoins notre communauté</A>
                        </Show>
                    </div>
                </div>
                
                <div class="overflow-x-hidden gap-6 md:gap-8 container-app w-full flex flex-col md:flex-row justify-between items-center bg-color-light mt-8 md:mt-0">
                    <div class="w-full md:w-6/12 flex flex-col gap-3 md:gap-4 order-2 md:order-1">
                        <h1 class="text-color-dark text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Ensemble, changeons le voyage</h1>
                        <h2 class="text-color-dark opacity-90 text-xl sm:text-2xl md:text-3xl font-bold">Rejoins la communauté qui réinvente le voyage entre femmes</h2>
                        <p class="mt-2 md:mt-4 text-color-dark opacity-50 text-sm sm:text-base text-justify">Panjéa est né d'une conviction simple : les plus beaux voyages sont ceux que l'on partage avec les bonnes personnes. Notre plateforme réinvente le voyage en groupe en privilégiant la liberté. Fini les voyages organisés rigides et les groupes imposés. Avec Panjéa, vous choisissez vos compagnons de route et créez votre itinéraire sur-mesure</p>
                    </div>
                    <div class="w-full md:w-6/12 order-1 md:order-2">
                        <img class="w-full h-auto rounded-xl md:rounded-none" src="/images/happyGirl.webp" alt="2 happy girls in Turkey"/>
                    </div>
                </div>
                
                <div class="container-app pt-12 md:pt-50 gap-6 md:gap-8 w-full flex flex-col justify-center items-center">
                    <h1 class="text-color-dark text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4">Ce qui nous rend uniques</h1>
                    <h3 class="text-base sm:text-lg md:text-xl text-center text-color-dark opacity-50 px-4">
                        Panjéa n'est pas qu'une simple plateforme de voyage - c'est la première communauté qui te donne vraiment le contrôle de ton aventure. Fini les groupes imposés, les itinéraires préfabriqués, et les rencontres superficielles.
                    </h3>

                    <div class="mt-6 md:mt-8 w-full gap-4 md:gap-8 flex flex-col">
                        <div class="gap-4 md:gap-8 w-full flex flex-col md:flex-row justify-between items-stretch">
                            <div class="w-full md:w-1/2 flex flex-col gap-3 md:gap-4 shadow-md bg-[#146865]/15 rounded-xl p-6 md:p-8">
                                <div class="flex flex-row justify-between items-center">
                                    <div class="bg-white w-12 h-12 md:w-14 md:h-14 rounded-full flex justify-center items-center">
                                        <FemaleGenderIcon color={'#146865'} size={28} class="md:w-[34px] md:h-[34px]" />
                                    </div>
                                    <h2 class="text-black font-semibold text-sm sm:text-base md:text-lg">Profile 100% féminin</h2>
                                </div>
                                <p class="text-sm sm:text-base text-justify opacity-50 text-color-dark">
                                    Ici, chaque membre est une voyageuse comme toi. Une communauté exclusivement féminine pour échanger, s'inspirer et créer des liens autour du voyage.
                                </p>
                            </div>

                            <div class="w-full md:w-1/2 flex flex-col gap-3 md:gap-4 shadow-md bg-[#146865]/15 rounded-xl p-6 md:p-8">
                                <div class="flex flex-row justify-between items-center">
                                    <div class="bg-white w-12 h-12 md:w-14 md:h-14 rounded-full flex justify-center items-center">
                                        <ShieldIcon color={'#146865'} size={28} class="md:w-[34px] md:h-[34px]"/>
                                    </div>
                                    <h2 class="text-black font-semibold text-sm sm:text-base md:text-lg">Sécurité et Confiance</h2>
                                </div>
                                <p class="text-sm sm:text-base text-justify opacity-50 text-color-dark">
                                    Nous mettons votre sérénité au cœur de Panjéa. Vérification des profils, outils de signalement et entraide entre voyageuses sont de la partie.
                                </p>
                            </div>
                        </div>

                        <div class="gap-4 md:gap-8 w-full flex flex-col md:flex-row justify-between items-stretch">
                            <div class="w-full md:w-1/2 flex flex-col gap-3 md:gap-4 shadow-md bg-[#146865]/15 rounded-xl p-6 md:p-8">
                                <div class="flex flex-row justify-between items-center">
                                    <div class="bg-white w-12 h-12 md:w-14 md:h-14 rounded-full flex justify-center items-center">
                                        <DownDollarIcon color={'#146865'} size={28} class="md:w-[34px] md:h-[34px]"/>
                                    </div>
                                    <h2 class="text-black font-semibold text-sm sm:text-base md:text-lg">Gratuit + bons plans</h2>
                                </div>
                                <p class="text-sm sm:text-base text-justify opacity-50 text-color-dark">
                                    Profite de notre plateforme 100% gratuite avec des partenariats exclusifs pour voyager malin : bons plans, réductions, accès privilégié à des services de vrais pros.
                                </p>
                            </div>

                            <div class="w-full md:w-1/2 flex flex-col gap-3 md:gap-4 shadow-md bg-[#146865]/15 rounded-xl p-6 md:p-8">
                                <div class="flex flex-row justify-between items-center">
                                    <div class="bg-white w-12 h-12 md:w-14 md:h-14 rounded-full flex justify-center items-center">
                                        <PeaceIcon color={'#146865'} size={28} class="md:w-[34px] md:h-[34px]" />
                                    </div>
                                    <h2 class="text-black font-semibold text-sm sm:text-base md:text-lg">Liberté de choix</h2>
                                </div>
                                <p class="text-sm sm:text-base text-justify opacity-50 text-color-dark">
                                    Rejoindre ou organiser un voyage ? C'est toi qui choisis ! Tu es libre d'inviter qui tu veux, ou de faire de nouvelles rencontres.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="relative font-bold pt-12 md:pt-50 pb-16 md:pb-32">
                    <h1 class="relative z-50 text-color-dark text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center px-4 mb-8 md:mb-0">Ces rencontres qui ont inspiré Panjéa</h1>
                    <img src="/images/backGreenWage.webp" class="absolute top-40 z-0 hidden md:block" alt=""/>
                    <div class="container-app mt-8 md:mt-16">
                        <div class="flex flex-col md:flex-row rounded-xl md:rounded-xl overflow-hidden shadow-md shadow-green-800/10">
                            <div class="gap-3 md:gap-2 w-full md:w-8/12 relative z-50 flex flex-col justify-between p-6 md:p-8 bg-white order-2 md:order-1">
                                <div>
                                    <h1 class="text-justify font-semibold text-base sm:text-lg md:text-xl text-color-dark">Panjéa, c'est exactement ce qu'il manquait : une plateforme qui facilite ces rencontres et permet de créer des amitiés durables à travers le voyage.</h1>
                                    <p class="mt-3 md:mt-2 text-color-dark text-justify text-sm sm:text-base font-normal">Je suis partie au Pérou avec des inconnues... Aujourd'hui, l'une d'entre elles est devenue ma meilleure amie de voyage ! Ensemble, nous avons réalisé notre rêve de tour du monde. C'est exactement ce que je veux retrouver avec Panjéa : car trouver des compagnons de voyage, c'est bien, mais créer des amitiés qui durent, c'est encore mieux</p>
                                </div>

                                <div class="mt-4 md:mt-0">
                                    <h3 class="text-color-dark font-medium text-sm sm:text-base">Marion, 31 ans</h3>
                                    <h4 class="text-color-dark opacity-50 font-medium text-xs sm:text-sm">Chargée d'affaires BtoB - célibataire vit à Montpellier</h4>
                                </div>
                            </div>
                            <div class="w-full md:w-4/12 relative z-50 order-1 md:order-2">
                                <img src="/images/marion.avif" class="w-full h-48 md:h-full object-cover" alt="Marion témoignage"/>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    )
}