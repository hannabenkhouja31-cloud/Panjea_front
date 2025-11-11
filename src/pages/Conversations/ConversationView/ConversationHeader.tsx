import { MoreVertical } from "lucide-solid";
import type { Trip } from "../../../models";
import { getFirstTripImage } from "../utils";

interface ConversationHeaderProps {
    trip: Trip;
}

export const ConversationHeader = (props: ConversationHeaderProps) => {
    return (
        <div class="p-4 border-b-2 border-black flex items-center gap-3 min-h-[7vh] flex-shrink-0">
            <img 
                src={getFirstTripImage(props.trip)}
                alt={props.trip.title}
                class="w-12 h-12 rounded-lg object-cover border-2 border-black"
            />
            <div class="flex-1">
                <h2 class="text-xl font-bold text-color-dark">{props.trip.title}</h2>
                <p class="text-sm text-gray-500">{props.trip.destinationCountry}</p>
            </div>
            <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <MoreVertical size={24} class="text-gray-600" />
            </button>
        </div>
    );
};