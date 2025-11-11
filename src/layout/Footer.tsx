import {A} from "@solidjs/router";
import {InstagramIcon, TikTokIcon} from "../assets/images/icons.tsx";

export const Footer = () => {
    return (

            <div class={"relative h-full w-full flex flex-col gap-8 footer-gradient p-16"}>            <div class={"h-full w-full flex flex-row gap-4 justify-between items-start"}>
                <div class={"flex-1 w-1/4 flex flex-col gap-2 justify-center pt-6 items-center"}>
                    <img src="/logo.avif" class={"w-24 h-24"} alt=""/>
                    <h1 class={"text-white text-xl font-bold"}>Panjéa</h1>
                </div>
                <div class={"flex flex-row items-start justify-between w-3/4"}>
                <div class={"flex-1 w-1/4 flex flex-col gap-4"}>
                    <h1 class={"text-white text-xl font-bold"}>A propos de Panjéa</h1>
                    <h1 class={"text-white text-sm text-justify"}>Panjéa est une plateforme de mise en relation
                        entre voyageuses permettant de trouver vos compagnons de voyage idéaux en toute confiance.
                        Rejoignez notre communauté et transformez chaque aventure en une expérience humaine
                        enrichissante !
                    </h1>
                </div>
                <div class={"text-white flex-1 w-1/4 flex flex-col items-center gap-4"}>
                    <h1 class={"text-xl font-bold"}>Ressources</h1>
                    <nav class={"text-sm flex flex-col gap-4"}>
                        <A href={"/"}>Centre d'aide</A>
                        <A href={"/"}>Voyage</A>
                        <A href={"/"}>Découvrir</A>
                        <A href={"/"}>Contactez-nous</A>
                    </nav>
                </div>
                <div class={"text-white text-sm flex-1 w-1/4 flex items flex-col gap-4"}>
                    <h1 class={"text-xl font-bold"}>Mentions légales</h1>
                    <nav class={" text-sm flex flex-col gap-4"}>
                        <A href={"/"}>Conditions</A>
                        <A href={"/"}>Confidentialité</A>
                        <A href={"/"}>Cookies</A>
                    </nav>
                </div>
            </div>
            </div>
            <div class={"w-full h-1 bg-white"}/>
            <p class={"text-justify text-sm text-white"}>
                Toutes les rédactions sont restaurées d'ici 2025 sur Panjéa.fr. Nous accordons une grande importance à votre vie privée et nous engageons à protéger vos informations personnelles. Toutes les données que vous partagez avec nous sont utilisées uniquement pour améliorer votre expérience et ne sont jamais vendues ou partagées avec des tiers. En utilisant notre site Web, vous acceptez nos termes et conditions. Cela inclut une utilisation équitable de nos outils, le respect des lois applicables et le respect de nos droits de propriété intellectuelle.
            </p>
            <div class={"flex flex-row justify-center items-center gap-8"}>
                <A href={"https://www.instagram.com/panjeatravel/"}><InstagramIcon size={32}/></A>
                <A href={"https://www.tiktok.com/@panjeatravel"}><TikTokIcon size={32}/></A>
            </div>
        </div>

    )
}