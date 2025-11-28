import {A} from "@solidjs/router";
import {InstagramIcon, TikTokIcon} from "../assets/images/icons.tsx";

export const Footer = () => {
    return (
        <div class={"relative h-full w-full flex flex-col gap-4 sm:gap-6 md:gap-8 footer-gradient p-4 sm:p-8 md:p-12 lg:p-16"}>
            <div class={"h-full w-full flex flex-col lg:flex-row gap-6 lg:gap-4 justify-between items-start"}>
                <div class={"w-full lg:flex-1 lg:w-1/4 flex flex-col gap-2 justify-center pt-4 lg:pt-6 items-center"}>
                    <img src="/logo.avif" class={"w-20 h-20 sm:w-24 sm:h-24"} alt=""/>
                    <h1 class={"text-white text-lg sm:text-xl font-bold"}>Panjéa</h1>
                </div>
                <div class={"w-full flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-4 lg:w-3/4"}>
                    <div class={"w-full sm:flex-1 sm:w-1/3 flex flex-col gap-3 sm:gap-4"}>
                        <h1 class={"text-white text-base sm:text-lg md:text-xl font-bold"}>A propos de Panjéa</h1>
                        <h1 class={"text-white text-xs sm:text-sm text-justify"}>Panjéa est une plateforme de mise en relation
                            entre voyageuses permettant de trouver vos compagnons de voyage idéaux en toute confiance.
                            Rejoignez notre communauté et transformez chaque aventure en une expérience humaine
                            enrichissante !
                        </h1>
                    </div>
                    <div class={"text-white w-full sm:flex-1 sm:w-1/3 flex flex-col items-start sm:items-center gap-3 sm:gap-4"}>
                        <h1 class={"text-base sm:text-lg md:text-xl font-bold"}>Ressources</h1>
                        <nav class={"text-xs sm:text-sm flex flex-col gap-2 sm:gap-4"}>
                            <A href={"/"}>Centre d'aide</A>
                            <A href={"/"}>Voyage</A>
                            <A href={"/"}>Découvrir</A>
                            <A href={"/"}>Contactez-nous</A>
                        </nav>
                    </div>
                    <div class={"text-white text-xs sm:text-sm w-full sm:flex-1 sm:w-1/3 flex flex-col gap-3 sm:gap-4"}>
                        <h1 class={"text-base sm:text-lg md:text-xl font-bold"}>Mentions légales</h1>
                        <nav class={"text-xs sm:text-sm flex flex-col gap-2 sm:gap-4"}>
                            <A href={"/"}>Conditions</A>
                            <A href={"/"}>Confidentialité</A>
                            <A href={"/"}>Cookies</A>
                        </nav>
                    </div>
                </div>
            </div>
            <div class={"w-full h-1 bg-white"}/>
            <p class={"text-justify text-xs sm:text-sm text-white"}>
                Toutes les rédactions sont restaurées d'ici 2025 sur Panjéa.fr. Nous accordons une grande importance à votre vie privée et nous engageons à protéger vos informations personnelles. Toutes les données que vous partagez avec nous sont utilisées uniquement pour améliorer votre expérience et ne sont jamais vendues ou partagées avec des tiers. En utilisant notre site Web, vous acceptez nos termes et conditions. Cela inclut une utilisation équitable de nos outils, le respect des lois applicables et le respect de nos droits de propriété intellectuelle.
            </p>
            <div class={"flex flex-row justify-center items-center gap-6 sm:gap-8"}>
                <A href={"https://www.instagram.com/panjeatravel/"}><InstagramIcon size={28} class="sm:w-8 sm:h-8"/></A>
                <A href={"https://www.tiktok.com/@panjeatravel"}><TikTokIcon size={28} class="sm:w-8 sm:h-8"/></A>
            </div>
        </div>
    )
}