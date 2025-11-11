import { formatDate } from "../utils";

interface DateSeparatorProps {
    date: string;
}

export const DateSeparator = (props: DateSeparatorProps) => {
    return (
        <div class="flex items-center justify-center my-6">
            <div class="bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full">
                {formatDate(props.date)}
            </div>
        </div>
    );
};