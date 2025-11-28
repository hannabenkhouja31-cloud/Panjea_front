import { MoreVertical, ArrowLeft } from "lucide-solid";
import type { Trip } from "../../../models";
import { getFirstTripImage } from "../utils";

interface ConversationHeaderProps {
    trip: Trip;
    onBack?: () => void;
}

export const ConversationHeader = (props: ConversationHeaderProps) => {
    return (
        <div class="px-3 py-2 sm:p-4 border-b-2 border-black flex items-center gap-2 sm:gap-3 min-h-[56px] sm:min-h-[7vh] flex-shrink-0 bg-white z-10 shadow-sm">
            <button
                onClick={props.onBack}
                class="sm:hidden p-1 -ml-1 text-color-dark hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft size={24} />
            </button>

            <a href={"/voyage/"+props.trip.id} class="flex-shrink-0">
                <img
                    src={getFirstTripImage(props.trip)}
                    alt={props.trip.title}
                    class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border-2 border-black"
                />
            </a>
            <a href={"/voyage/"+props.trip.id} class="flex-1 min-w-0">
                <h2 class="text-base sm:text-xl font-bold text-color-dark truncate leading-tight">{props.trip.title}</h2>
                <p class="text-xs sm:text-sm text-gray-500 truncate leading-tight">{props.trip.destinationCountry}</p>
            </a>
            <button class="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                <MoreVertical size={20} class="text-gray-600 sm:w-6 sm:h-6" />
            </button>
        </div>
    );
};