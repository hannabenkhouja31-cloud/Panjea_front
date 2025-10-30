import { For, Show, createSignal, onCleanup, createEffect } from "solid-js";
import { MoreVertical, Send, Image, MessageSquare, X, Check } from "lucide-solid";
import type { Trip } from "../../models";
import { messagesStore, getMessagesByTripId, setMessageAsRead } from "../../stores/messagesStore";
import { sendMessage } from "../../stores/websocketStore";
import { user } from "../../stores/userStore";
import { useNavigate } from "@solidjs/router";
import { AskerUsername } from "./AskerUsername";

interface ConversationViewProps {
    trip: Trip | null;
}

export const ConversationView = (props: ConversationViewProps) => {

    const navigate = useNavigate();
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

    const getFirstTripImage = (tripItem: Trip | null) => {
        if(tripItem === null) return "/images/citiesBeautiful.png";
        else if (tripItem.media && tripItem.media.length > 0) {
            return tripItem.media[0].url;
        } else {
            return "/images/citiesBeautiful.png";
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Aujourd'hui";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hier";
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    };

    const isSameDay = (date1: string, date2: string) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.toDateString() === d2.toDateString();
    };

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
                <div class="flex-1 flex flex-col items-center justify-center bg-gray-50">
                    <MessageSquare size={64} class="text-gray-300 mb-4" />
                    <p class="text-gray-500 text-lg">Sélectionnez une conversation</p>
                </div>
            }
        >
            <div class="flex-1 flex flex-col h-full">
                <div class="p-4 border-b-2 border-black flex items-center gap-3 min-h-[7vh] flex-shrink-0">
                    <img 
                        src={getFirstTripImage(props.trip)}
                        alt={props.trip?.title}
                        class="w-12 h-12 rounded-lg object-cover border-2 border-black"
                    />
                    <div class="flex-1">
                        <h2 class="text-xl font-bold text-color-dark">{props.trip?.title}</h2>
                        <p class="text-sm text-gray-500">{props.trip?.destinationCountry}</p>
                    </div>
                    <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical size={24} class="text-gray-600" />
                    </button>
                </div>

                <div 
                    ref={scrollContainerRef} 
                    class="flex-1 overflow-y-auto p-4 bg-gray-50"
                    style={{ opacity: isInitialLoad() ? 0 : 1, transition: 'opacity 0.15s' }}
                >
                    <Show when={isLoadingMore()}>
                        <div class="flex justify-center py-4">
                            <span class="loading loading-spinner loading-md text-color-main"></span>
                        </div>
                    </Show>
                    
                    <div ref={setTopSentinelRef} class="h-1" />

                    <For each={currentMessages()}>
                        {(message, index) => {
                            const showDateSeparator = () => {
                                if (index() === 0) return true;
                                const prevMessage = currentMessages()[index() - 1];
                                return !isSameDay(message.createdAt, prevMessage.createdAt);
                            };

                            const isMine = message.sender.id === user.profile?.id;
                            const isQuestion = message.questionData?.type === 'question';
                            const isAnswer = message.questionData?.type === 'answer';
                            const isJoinRequest = message.questionData?.type === 'join_request';
                            const isJoinAccepted = message.questionData?.type === 'join_accepted';
                            const isJoinDeclined = message.questionData?.type === 'join_declined';
                            const isJoinNotification = message.questionData?.type === 'join_notification';
                            

                            return (
                                <>
                                    <Show when={showDateSeparator()}>
                                        <div class="flex items-center justify-center my-6">
                                            <div class="bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                {formatDate(message.createdAt)}
                                            </div>
                                        </div>
                                    </Show>

                                    <Show when={isQuestion}>
                                        <div class="my-4 flex justify-center w-full">
                                            <div class="w-full max-w-lg p-4 bg-white border-color-secondary rounded-xl">
                                                <div class="flex items-start gap-3">
                                                    <div 
                                                        onClick={() => navigate(`/user/${message.sender.id}`)}
                                                        class="w-10 h-10 rounded-full bg-black border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                                                    >
                                                        <Show 
                                                            when={message.sender.profilePictureUrl}
                                                            fallback={
                                                                <span class="text-white font-bold text-lg">
                                                                    {message.sender.username[0].toUpperCase()}
                                                                </span>
                                                            }
                                                        >
                                                            <img 
                                                                src={message.sender.profilePictureUrl} 
                                                                alt={message.sender.username}
                                                                class="w-full h-full object-cover"
                                                            />
                                                        </Show>
                                                    </div>
                                                    
                                                    <div class="flex-1">
                                                        <div class="flex items-center gap-2 mb-1">
                                                            <MessageSquare size={16} class="text-color-secondary" />
                                                            <span class="text-sm font-semibold text-color-secondary">
                                                                Question de {message.sender.username}
                                                            </span>
                                                        </div>
                                                        <p class="text-color-dark whitespace-pre-line mb-3">{message.content}</p>
                                                        <Show when={isUserTrip()}>
                                                            <button
                                                                onClick={() => openAnswerModal(message.id, message.sender.id)}
                                                                class="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                                                            >
                                                                Répondre
                                                            </button>
                                                        </Show>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Show>

                                    <Show when={isAnswer}>
                                        <div class="my-4 flex justify-center w-full">
                                            <div class="w-full max-w-lg p-4 border-2 border-color-main rounded-xl">
                                                <div class="flex items-start gap-3">
                                                    <div 
                                                        onClick={() => navigate(`/user/${message.sender.id}`)}
                                                        class="w-10 h-10 rounded-full bg-color-main border-2 border-color-main flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                                                    >
                                                        <Show 
                                                            when={message.sender.profilePictureUrl}
                                                            fallback={
                                                                <span class="text-white font-bold text-lg">
                                                                    {message.sender.username[0].toUpperCase()}
                                                                </span>
                                                            }
                                                        >
                                                            <img 
                                                                src={message.sender.profilePictureUrl} 
                                                                alt={message.sender.username}
                                                                class="w-full h-full object-cover"
                                                            />
                                                        </Show>
                                                    </div>
                                                    
                                                    <div class="truncate">
                                                        <div class="flex items-center gap-2 mb-1 ">
                                                            <MessageSquare size={16} class="text-black" />
                                                            <span class="flex text-sm font-semibold text-black">
                                                                Votre réponse à&nbsp;<AskerUsername askerId={message.questionData?.askerId} />
                                                            </span>
                                                        </div>
                                                        
                                                        <p class="italic text-color-dark truncate-text">"{message.content}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Show>

                                    <Show when={isJoinNotification}>
                                        <div class="flex items-center justify-center my-6">
                                            <div class="bg-gray-300 text-gray-600 text-sm px-4 py-2 rounded-full">
                                                {message.content}
                                            </div>
                                        </div>
                                    </Show>

                                    <Show when={isJoinRequest}>
                                        <div class="my-4 flex justify-center w-full">
                                            <div class="w-full max-w-lg p-4 bg-white border-2 border-color-secondary rounded-xl">
                                                <div class="flex items-start gap-3">
                                                    <div 
                                                        onClick={() => navigate(`/user/${message.sender.id}`)}
                                                        class="w-10 h-10 rounded-full bg-black border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                                                    >
                                                        <Show 
                                                            when={message.sender.profilePictureUrl}
                                                            fallback={
                                                                <span class="text-white font-bold text-lg">
                                                                    {message.sender.username[0].toUpperCase()}
                                                                </span>
                                                            }
                                                        >
                                                            <img 
                                                                src={message.sender.profilePictureUrl} 
                                                                alt={message.sender.username}
                                                                class="w-full h-full object-cover"
                                                            />
                                                        </Show>
                                                    </div>
                                                    
                                                    <div class="flex-1">
                                                        <div class="flex items-center gap-2 mb-1">
                                                            <MessageSquare size={16} class="text-color-secondary" />
                                                            <span class="text-sm font-semibold text-color-secondary">
                                                                Demande de participation
                                                            </span>
                                                        </div>
                                                        <p class="text-color-dark mb-3">{message.content}</p>
                                                        <Show when={isUserTrip()}>
                                                            <div class="flex gap-2 w-full">
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!props.trip) return;
                                                                        const backendUrl = import.meta.env.VITE_BACKEND_URL;
                                                                        await fetch(`${backendUrl}/trip-members/${props.trip.id}/accept/${message.sender.id}`, {
                                                                            method: 'PATCH',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ 
                                                                                organizerId: user.profile?.id,
                                                                                messageId: message.id
                                                                            })
                                                                        });
                                                                    }}
                                                                    class="flex-1 bg-color-main text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                                                                >
                                                                    Accepter
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!props.trip) return;
                                                                        const backendUrl = import.meta.env.VITE_BACKEND_URL;
                                                                        await fetch(`${backendUrl}/trip-members/${props.trip.id}/decline/${message.sender.id}`, {
                                                                            method: 'PATCH',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ 
                                                                                organizerId: user.profile?.id,
                                                                                messageId: message.id
                                                                            })
                                                                        });
                                                                    }}
                                                                    class="flex-1 bg-color-secondary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                                                                >
                                                                    Décliner
                                                                </button>
                                                            </div>
                                                        </Show>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Show>

                                    <Show when={isJoinAccepted}>
                                        <div class="my-4 flex justify-center w-full">
                                            <div class="w-full max-w-lg p-4 border-2 border-color-main rounded-xl">
                                                <div class="flex items-center gap-2 justify-center">
                                                    <Check color="#146865" />
                                                    <span class="text-color-main font-semibold">Demande acceptée</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Show>

                                    <Show when={isJoinDeclined}>
                                        <div class="my-4 flex justify-center w-full">
                                            <div class="w-full max-w-lg p-4 bg-orange-50 border-2 border-color-secondary rounded-xl">
                                                <div class="flex items-center gap-2 justify-center">
                                                    <span class="text-color-secondary font-semibold">✗ Demande refusée</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Show>

                                    <Show when={!isQuestion && !isAnswer && !isJoinRequest && !isJoinAccepted && !isJoinDeclined && !isJoinNotification}>
                                        <div class={`flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2 mb-4`}>
                                            <Show when={!isMine}>
                                                <div class="w-8 h-8 rounded-full bg-black border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    <Show 
                                                        when={message.sender.profilePictureUrl}
                                                        fallback={
                                                            <span class="text-white font-bold text-sm">
                                                                {message.sender.username[0].toUpperCase()}
                                                            </span>
                                                        }
                                                    >
                                                        <img 
                                                            src={message.sender.profilePictureUrl} 
                                                            alt={message.sender.username}
                                                            class="w-full h-full object-cover"
                                                        />
                                                    </Show>
                                                </div>
                                            </Show>
                                            <div class="relative">
                                                <div class={`max-w-md ${isMine ? "bg-color-main text-white" : "bg-gray-200 text-color-dark"} rounded-2xl px-4 py-3`}>
                                                    <Show when={!isMine}>
                                                        <p class="font-semibold text-xs mb-1">{message.sender.username}</p>
                                                    </Show>
                                                    <p class="whitespace-pre-line">{message.content}</p>
                                                    <div class="flex items-center justify-end gap-1 mt-1">
                                                        <span class={`text-xs ${isMine ? "text-white opacity-70" : "text-gray-500"}`}>
                                                            {formatTime(message.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Show when={!isMine}>
                                                    <div 
                                                        class="absolute -rotate-45 -bottom-[8px] -left-[2px] w-0 h-0"
                                                        style={{
                                                            "border-top": "12px solid transparent",
                                                            "border-bottom": "12px solid transparent",
                                                            "border-right": "12px solid rgb(228, 228, 228)"
                                                        }}
                                                    />
                                                </Show>
                                                <Show when={isMine}>
                                                    <div 
                                                        class="absolute rotate-45 -bottom-[8px] -right-[2px] w-2 h-2"
                                                        style={{
                                                            "border-top": "12px solid transparent",
                                                            "border-bottom": "12px solid transparent",
                                                            "border-left": "12px solid #146865"
                                                        }}
                                                    />
                                                </Show>
                                            </div>
                                        </div>
                                    </Show>
                                </>
                            );
                        }}
                    </For>
                </div>

                <div class="p-4 border-t-2 border-black">
                    <div class="flex items-center gap-3">
                        <div class="flex gap-2">
                            <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors" disabled>
                                <Image size={24} class="text-gray-400" />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={messageInput()}
                            onInput={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Écrivez votre message..."
                            class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main transition-colors bg-white text-color-dark"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!messageInput().trim()}
                            class="p-3 bg-color-main text-white rounded-xl hover:bg-gradient-main transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>

                <dialog id="answer_question_modal" class="modal">
                    <div class="modal-box max-w-lg bg-white">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-2xl text-color-dark">Répondre à la question</h3>
                            <form method="dialog">
                                <button class="btn btn-sm btn-circle btn-ghost">
                                    <X size={20} />
                                </button>
                            </form>
                        </div>
                        
                        <textarea
                            value={answerText()}
                            onInput={(e) => setAnswerText(e.currentTarget.value)}
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-color-main transition-colors bg-white text-color-dark resize-none"
                            rows={5}
                            placeholder="Écrivez votre réponse..."
                            disabled={isSendingAnswer()}
                        />

                        <div class="modal-action">
                            <form method="dialog">
                                <button class="btn btn-ghost" disabled={isSendingAnswer()}>Annuler</button>
                            </form>
                            <button
                                class="btn bg-color-main text-white hover:bg-gradient-main border-0"
                                onClick={handleSendAnswer}
                                disabled={!answerText().trim() || isSendingAnswer()}
                            >
                                <Show when={!isSendingAnswer()} fallback={<span class="loading loading-spinner loading-sm"></span>}>
                                    Envoyer
                                </Show>
                            </button>
                        </div>
                    </div>
                    <form method="dialog" class="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
            </div>
        </Show>
    );
};