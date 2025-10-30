import { createSignal, For, Show } from "solid-js";
import { trip } from "../../../stores/tripStore";

export const TripImages = () => {
    

    const [currentImageIndex, setCurrentImageIndex] = createSignal(0);

    const tripImages = () => {
        if ((trip.currentTrip as any)?.media && (trip.currentTrip as any).media.length > 0) {
            return (trip.currentTrip as any).media;
        }
        return [{ url: "/images/citiesBeautiful.png", id: "default", position: 1 }];
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % tripImages().length);
    };

    const previousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + tripImages().length) % tripImages().length);
    };


    return(
            <div class="relative rounded-2xl overflow-hidden h-96 bg-gray-200 group">
                <img
                    src={tripImages()[currentImageIndex()].url}
                    alt={trip.currentTrip?.title}
                    class="w-full h-full object-cover block"
                    onError={(e) => {
                        console.error("Erreur chargement image carousel:", tripImages()[currentImageIndex()].url);
                        e.currentTarget.src = "/images/citiesBeautiful.png";
                    }}
                    onLoad={() => console.log("Image carousel chargée:", tripImages()[currentImageIndex()].url)}
                />
                                    
                <Show when={tripImages().length > 1}>
                    <button
                        onClick={previousImage}
                        class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextImage}
                        class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full z-20">
                        <For each={tripImages()}>
                            {(_, index) => (
                                <button
                                    onClick={() => setCurrentImageIndex(index())}
                                    class={`w-2 h-2 rounded-full transition-all ${
                                        currentImageIndex() === index() 
                                        ? 'bg-white w-6' 
                                        : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                />
                            )}
                        </For>
                    </div>
                </Show>
            </div>
    )
}