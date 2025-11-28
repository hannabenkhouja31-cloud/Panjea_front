import { For, Show, createSignal, onCleanup, createEffect } from "solid-js";
import { MessageSquare } from "lucide-solid";
import type { ConversationViewProps } from "../types";
import { sendMessage } from "../../../stores/websocketStore";
import { user } from "../../../stores/userStore";
import { ConversationHeader } from "./ConversationHeader";
import { MessageInput } from "./MessageInput";
import { AnswerModal } from "./AnswerModal";
import { MessageItem } from "./MessageItem";
import {getMessagesByTripId, messagesStore, setMessageAsRead} from "../../../stores/messagesStore.ts";

interface ExtendedConversationViewProps extends ConversationViewProps {
    onBack?: () => void;
}

export const ConversationView = (props: ExtendedConversationViewProps) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [messageInput, setMessageInput] = createSignal("");
    const [isLoadingMore, setIsLoadingMore] = createSignal(false);
    const [shouldAutoScroll, setShouldAutoScroll] = createSignal(true);
    const [answerText, setAnswerText] = createSignal("");
    const [selectedQuestion, setSelectedQuestion] = createSignal<{id: string, askerId: string} | null>(null);
    const [isSendingAnswer, setIsSendingAnswer] = createSignal(false);
    const [isInitialLoad, setIsInitialLoad] = createSignal(true);

    let scrollContainerRef: HTMLDivElement | undefined;
    const [topSentinelRef, setTopSentinelRef] = createSignal<HTMLDivElement>();

    const scrollToBottom = (instant: boolean = false) => {
        if (scrollContainerRef) {
            if (instant) {
                scrollContainerRef.scrollTop = scrollContainerRef.scrollHeight;
            } else {
                scrollContainerRef.scrollTo({
                    top: scrollContainerRef.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleSend = () => {
        const content = messageInput().trim();
        if (content && props.trip && user.profile?.id) {
            sendMessage(props.trip.id, user.profile.id, content);
            setMessageInput("");
            setShouldAutoScroll(true);
        }
    };

    const openAnswerModal = (questionId: string, askerId: string) => {
        setSelectedQuestion({ id: questionId, askerId });
        setAnswerText("");
        const modal = document.getElementById('answer_question_modal') as HTMLDialogElement;
        modal?.showModal();
    };

    const handleSendAnswer = async () => {
        if (!answerText().trim() || !selectedQuestion() || !props.trip || !user.profile?.id) return;

        setIsSendingAnswer(true);

        try {
            const response = await fetch(`${backendUrl}/trips/${props.trip.id}/answer-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organizerId: user.profile.id,
                    askerId: selectedQuestion()!.askerId,
                    answer: answerText(),
                    relatedQuestionId: selectedQuestion()!.id,
                }),
            });

            if (response.ok) {
                const modal = document.getElementById('answer_question_modal') as HTMLDialogElement;
                modal?.close();
                setAnswerText("");
                setSelectedQuestion(null);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la réponse:', error);
        } finally {
            setIsSendingAnswer(false);
        }
    };

    const loadMoreMessages = async () => {
        if (!props.trip || isLoadingMore() || !user.profile?.id) return;

        const meta = messagesStore.metaByTrip[props.trip.id];
        if (!meta || !meta.hasMore) return;

        setIsLoadingMore(true);
        setShouldAutoScroll(false);

        const scrollHeight = scrollContainerRef?.scrollHeight || 0;

        await getMessagesByTripId(props.trip.id, user.profile.id, meta.page + 1, true);

        requestAnimationFrame(() => {
            if (scrollContainerRef) {
                const newScrollHeight = scrollContainerRef.scrollHeight;
                scrollContainerRef.scrollTop = newScrollHeight - scrollHeight;
            }
            setIsLoadingMore(false);
        });
    };

    createEffect(() => {
        const trip = props.trip;
        if (trip && user.profile?.id) {
            setIsInitialLoad(true);
            setShouldAutoScroll(true);

            getMessagesByTripId(trip.id, user.profile.id, 1, false).then(() => {
                requestAnimationFrame(() => {
                    scrollToBottom(true);
                    setTimeout(() => {
                        setIsInitialLoad(false);
                    }, 100);
                });
            });
        }
    });

    createEffect(() => {
        const messages = currentMessages();
        if (shouldAutoScroll() && !isInitialLoad() && scrollContainerRef && messages.length > 0) {
            requestAnimationFrame(() => {
                scrollToBottom(false);
            });
        }
    });

    createEffect(() => {
        const el = topSentinelRef();
        const trip = props.trip;

        if (!el || !trip) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !isLoadingMore() && props.trip) {
                    await loadMoreMessages();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);

        onCleanup(() => {
            observer.disconnect();
        });
    });

    createEffect(() => {
        const messages = currentMessages();
        const trip = props.trip;
        const userId = user.profile?.id;

        if (!trip || !userId || messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender.id !== userId && !lastMessage.readBy?.includes(userId)) {
            setMessageAsRead(lastMessage.id, userId);
        }
    });

    const currentMessages = () => {
        if (!props.trip) return [];
        const messages = messagesStore.messagesByTrip[props.trip.id] || [];
        return [...messages].reverse();
    };

    const isUserTrip = () => {
        return user.profile?.id === props.trip?.organizerId;
    };

    return (
        <Show
            when={props.trip}
            fallback={
                <div class="flex-1 hidden sm:flex flex-col items-center justify-center bg-gray-50 h-full">
                    <MessageSquare size={64} class="text-gray-300 mb-4" />
                    <p class="text-gray-500 text-lg">Sélectionnez une conversation</p>
                </div>
            }
        >
            <div class="flex-1 flex flex-col h-full bg-white relative w-full">
                <ConversationHeader trip={props.trip!} onBack={props.onBack} />

                <div
                    ref={scrollContainerRef}
                    class="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50"
                    style={{ opacity: isInitialLoad() ? 0 : 1, transition: 'opacity 0.15s' }}
                >
                    <Show when={isLoadingMore()}>
                        <div class="flex justify-center py-4">
                            <span class="loading loading-spinner loading-md text-color-main"></span>
                        </div>
                    </Show>

                    <div ref={setTopSentinelRef} class="h-1" />

                    <For each={currentMessages()}>
                        {(message, index) => (
                            <MessageItem
                                message={message}
                                previousMessage={index() > 0 ? currentMessages()[index() - 1] : null}
                                trip={props.trip!}
                                isUserTrip={isUserTrip()}
                                onAnswerQuestion={openAnswerModal}
                            />
                        )}
                    </For>
                </div>

                <Show when={!props.isQuestionView}>
                    <MessageInput
                        messageInput={messageInput}
                        setMessageInput={setMessageInput}
                        onSend={handleSend}
                    />
                </Show>

                <AnswerModal
                    answerText={answerText}
                    setAnswerText={setAnswerText}
                    isSending={isSendingAnswer}
                    onSend={handleSendAnswer}
                />
            </div>
        </Show>
    );
};