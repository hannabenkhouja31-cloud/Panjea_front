import { A } from "@solidjs/router";
import {DownDollarIcon, FemaleGenderIcon, PeaceIcon, ShieldIcon} from "../assets/images/icons.tsx";
import { Show } from "solid-js";
import { user } from "../stores/userStore.ts";

export const HomePage = () => {
    return (
            <div class="pb-32 bg-color-light">
                <div class="w-full pt-64 pb-32 relative z-0 bottom-32 text-white bg-gradient-main flex flex-col justify-center items-center">
                    <div class="container-app flex flex-col items-center justify-center">
                        <h1 class="font-bold text-5xl text-center">Réinventons le voyage entre femmes.</h1>
                        <h2 class="mt-4 font-medium text-3xl max-w-[776px] text-center mx-auto"> Décide de comment voyager et avec qui partager des moments uniques en toute sérénité</h2>
                        <Show when={!user.isConnected} fallback={<>
                                                    <A href="/voyage" class="cursor-pointer mt-8 btn-secondary text-xl">Rejoins notre communauté</A>
                          </>}>
                          <A href="/inscription" class="cursor-pointer mt-8 btn-secondary text-xl">Rejoins notre communauté</A>
                        </Show>
                    </div>
                </div>
                <div class="overflow-x-hidden gap-8 container-app w-full flex justify-between items-center bg-color-light">
                <div class={"w-6/12 flex flex-col gap-4"}>
                    <h1 class={"text-color-dark text-5xl font-bold"}>Ensemble, changeons le voyage</h1>
                    <h2 class={"text-color-dark opacity-90 text-3xl font-bold"}>Rejoins la communauté qui réinvente le voyage entre femmes</h2>
                    <p class={"mt-4 text-color-dark opacity-50 text-justify"}>Panjéa est né d'une conviction simple : les plus beaux voyages sont ceux que l'on partage avec les bonnes personnes. Notre plateforme réinvente le voyage en groupe en privilégiant la liberté. Fini les voyages organisés rigides et les groupes imposés. Avec Panjéa, vous choisissez vos compagnons de route et créez votre itinéraire sur-mesure </p>
                </div>
                <div class={"w-6/12"}>
                    <img class={""} src="/images/happyGirl.webp" alt="2 happy girls in Turkey"/>
                </div>
            </div>
            <div class={"container-app pt-50 px-16 gap-8 w-full flex flex-col justify-center items-center"}>
              <h1 class={"text-color-dark text-5xl font-bold"}>Ce qui nous rend uniques</h1>
              <h3 class={"text-xl text-center text-color-dark opacity-50"}>
                Panjéa n'est pas qu'une simple plateforme de voyage - c'est la première communauté qui te donne vraiment le contrôle de ton aventure. Fini les groupes imposés, les itinéraires préfabriqués, et les rencontres superficielles.
              </h3>

              <div class={"mt-8 w-full gap-8 flex flex-col"}>
                <div class={"gap-8 w-full flex flex-row justify-between items-stretch"}>
                  <div class={"w-1/2 flex flex-col gap-4 shadow-md bg-[#146865]/15 rounded-xl p-8 flex-1"}>
                    <div class={"flex flex-row justify-between items-center"}>
                      <div class={"bg-white w-14 h-14 rounded-full flex justify-center items-center"}>
                          <FemaleGenderIcon color={'#146865'} size={34} />
                      </div>
                      <h2 class={'text-black font-semibold'}>Profile 100% féminin</h2>
                    </div>
                    <p class={"text-justify opacity-50 text-color-dark"}>
                      Ici, chaque membre est une voyageuse comme toi. Une communauté exclusivement féminine pour échanger, s’inspirer et créer des liens autour du voyage.
                    </p>
                  </div>

                  <div class={"w-1/2 flex flex-col gap-4 shadow-md bg-[#146865]/15 rounded-xl p-8 flex-1"}>
                    <div class={"flex flex-row justify-between items-center"}>
                        <div class={"bg-white w-14 h-14 rounded-full flex justify-center items-center"}>
                            <ShieldIcon color={'#146865'} size={34}/>
                        </div>
                        <h2 class={'text-black font-semibold'}>Sécurité et Confiance</h2>
                    </div>
                      <p class={"text-justify opacity-50 text-color-dark"}>
                      Nous mettons votre sérénité au cœur de Panjéa. Vérification des profils, outils de signalement et entraide entre voyageuses sont de la partie.
                    </p>
                  </div>
                </div>

                <div class={"gap-8 w-full flex flex-row justify-between items-stretch"}>
                  <div class={"w-1/2 flex flex-col gap-4 shadow-md bg-[#146865]/15 rounded-xl p-8 flex-1"}>
                    <div class={"flex flex-row justify-between items-center"}>
                        <div class={"bg-white w-14 h-14 rounded-full flex justify-center items-center"}>
                            <DownDollarIcon color={'#146865'} size={34}/>
                        </div>
                        <h2 class={'text-black font-semibold'}>Gratuit + bons plans</h2>
                    </div>
                      <p class={"text-justify opacity-50 text-color-dark"}>
                      Profite de notre plateforme 100% gratuite avec des partenariats exclusifs pour voyager malin : bons plans, réductions, accès privilégié à des services de vrais pros.
                    </p>
                  </div>

                  <div class={"w-1/2 flex flex-col gap-4 shadow-md bg-[#146865]/15 rounded-xl p-8 flex-1"}>
                    <div class={"flex flex-row justify-between items-center"}>
                      <div class={"bg-white w-14 h-14 rounded-full flex justify-center items-center"}>
                          <PeaceIcon color={'#146865'} size={34} />
                      </div>
                      <h2 class={'text-black font-semibold'}>Liberté de choix</h2>
                    </div>
                    <p class={"text-justify opacity-50 text-color-dark"}>
                      Rejoindre ou organiser un voyage ? C'est toi qui choisis ! Tu es libre d'inviter qui tu veux, ou de faire de nouvelles rencontres.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class={"relative font-bold pt-50 pb-32"}>
                <h1 class={"relative z-50 text-color-dark text-5xl text-center"}>Ces rencontres qui ont inspiré Panjéa</h1>
                <img src="/images/backGreenWage.webp" class={"absolute top-40 z-0"} alt=""/>
                <div class={"mt-16 px-16 flex flex-row"}>
                    <div class={"gap-2 w-8/12 relative z-50 flex flex-col justify-between p-8 rounded-l-xl bg-white shadow-md shadow-green-800/10"}>
                        <div>
                            <h1 class={"text-justify font-semibold text-xl text-color-dark"}>Panjéa, c’est
                                exactement ce qu’il manquait : une plateforme qui facilite ces rencontres et permet de
                                créer des amitiés durables à travers le voyage.</h1>
                            <p class={"mt-2 text-color-dark text-justify text-base font-normal"}>Je suis partie au
                                Pérou avec des inconnues... Aujourd'hui, l'une d'entre elles est devenue ma meilleure
                                amie de voyage ! Ensemble, nous avons réalisé notre rêve de tour du monde. C'est
                                exactement ce que je veux
                                retrouver avec Panjéa : car trouver des compagnons de voyage, c'est bien, mais créer des
                                amitiés qui durent, c'est encore mieux</p>
                        </div>

                        <div>
                            <h3 class={"mt-4 text-color-dark font-medium"}>Marion, 31 ans</h3>
                            <h4 class={"text-color-dark opacity-50 font-medium"}>Chargée d'affaires BtoB - célibataire
                                vit à Montpellier</h4>
                        </div>
                    </div>
                    <img src="/images/marion.avif" class={"relative z-50 rounded-r-xl shadow-green-800/10 shadow-md"}
                         alt=""/>
                </div>
            </div>
        </div>
    )
}