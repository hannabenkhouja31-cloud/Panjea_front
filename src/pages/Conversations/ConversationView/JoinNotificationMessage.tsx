import { Check } from "lucide-solid";

interface JoinNotificationMessageProps {
    type: 'join_notification' | 'join_accepted' | 'join_declined';
    content: string;
}

export const JoinNotificationMessage = (props: JoinNotificationMessageProps) => {
    if (props.type === 'join_notification') {
        return (
            <div class="flex items-center justify-center my-6">
                <div class="bg-gray-300 text-gray-600 text-sm px-4 py-2 rounded-full">
                    {props.content}
                </div>
            </div>
        );
    }

    if (props.type === 'join_accepted') {
        return (
            <div class="my-4 flex justify-center w-full">
                <div class="w-full max-w-lg p-4 border-2 border-color-main rounded-xl">
                    <div class="flex items-center gap-2 justify-center">
                        <Check color="#146865" />
                        <span class="text-color-main font-semibold">Demande acceptée</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div class="my-4 flex justify-center w-full">
            <div class="w-full max-w-lg p-4 bg-orange-50 border-2 border-color-secondary rounded-xl">
                <div class="flex items-center gap-2 justify-center">
                    <span class="text-color-secondary font-semibold">✗ Demande refusée</span>
                </div>
            </div>
        </div>
    );
};