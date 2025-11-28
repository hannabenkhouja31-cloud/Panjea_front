import { Show } from "solid-js";
import type { Message } from "../types";
import type { Trip } from "../../../models";
import { DateSeparator } from "./DateSeparator";
import { QuestionMessage } from "./QuestionMessage";
import { AnswerMessage } from "./AnswerMessage";
import { JoinRequestMessage } from "./JoinRequestMessage";
import { JoinNotificationMessage } from "./JoinNotificationMessage";
import { RegularMessage } from "./RegularMessage";
import { isSameDay } from "../utils";

interface MessageItemProps {
    message: Message;
    previousMessage: Message | null;
    trip: Trip;
    isUserTrip: boolean;
    onAnswerQuestion: (messageId: string, askerId: string) => void;
}

export const MessageItem = (props: MessageItemProps) => {
    const showDateSeparator = () => {
        if (!props.previousMessage) return true;
        return !isSameDay(props.message.createdAt, props.previousMessage.createdAt);
    };

    const isQuestion = props.message.questionData?.type === 'question';
    const isAnswer = props.message.questionData?.type === 'answer';
    const isJoinRequest = props.message.questionData?.type === 'join_request';
    const isJoinAccepted = props.message.questionData?.type === 'join_accepted';
    const isJoinDeclined = props.message.questionData?.type === 'join_declined';
    const isJoinNotification = props.message.questionData?.type === 'join_notification';

    return (
        <>
            <Show when={showDateSeparator()}>
                <DateSeparator date={props.message.createdAt} />
            </Show>

            <Show when={isQuestion}>
                <QuestionMessage
                    message={props.message}
                    isUserTrip={props.isUserTrip}
                    onAnswer={props.onAnswerQuestion}
                />
            </Show>

            <Show when={isAnswer}>
                <AnswerMessage message={props.message} />
            </Show>

            <Show when={isJoinNotification}>
                <JoinNotificationMessage type="join_notification" content={props.message.content} />
            </Show>

            <Show when={isJoinRequest}>
                <JoinRequestMessage
                    message={props.message}
                    trip={props.trip}
                    isUserTrip={props.isUserTrip}
                />
            </Show>

            <Show when={isJoinAccepted}>
                <JoinNotificationMessage type="join_accepted" content={props.message.content} />
            </Show>

            <Show when={isJoinDeclined}>
                <JoinNotificationMessage type="join_declined" content={props.message.content} />
            </Show>

            <Show when={!isQuestion && !isAnswer && !isJoinRequest && !isJoinAccepted && !isJoinDeclined && !isJoinNotification}>
                <RegularMessage message={props.message} />
            </Show>
        </>
    );
};