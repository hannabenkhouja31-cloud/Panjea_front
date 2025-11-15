import { For, Show, type Accessor } from "solid-js";
import { MessageCircle, MessageSquare } from "lucide-solid";
import type { Message } from "../../../models";

interface UserQuestionsProps {
    questions: Accessor<Message[]>;
    isLoading: Accessor<boolean>;
}

export const UserQuestions = (props: UserQuestionsProps) => {
    return (
        <div class="bg-white rounded-2xl shadow-md p-6 mt-6">
            <h3 class="font-bold text-color-dark text-xl mb-4 flex items-center gap-2">
                <MessageCircle size={24} class="text-color-main" />
                Vos questions
            </h3>
            <Show 
                when={!props.isLoading()}
                fallback={
                    <div class="flex justify-center py-8">
                        <span class="loading loading-spinner loading-lg text-color-main"></span>
                    </div>
                }
            >
                <div class="space-y-4 overflow-scroll max-h-92">
                    <For each={props.questions()}>
                        {(message) => {
                            const relatedAnswer = () => {
                                if (message.questionData?.type === 'question') {
                                    return props.questions().find(m => 
                                        m.questionData?.type === 'answer' && 
                                        m.questionData?.relatedQuestionId === message.id
                                    );
                                }
                                return null;
                            };

                            return (
                                <Show when={message.questionData?.type === 'question'}>
                                    <div class="border-2 border-gray-200 rounded-xl p-4">
                                        <div class="flex items-start gap-3 mb-3">
                                            <MessageSquare size={20} class="text-color-secondary flex-shrink-0 mt-1" />
                                            <div class="flex-1">
                                                <p class="text-sm font-semibold text-color-secondary mb-1">Votre question</p>
                                                <p class="text-color-dark whitespace-pre-line">{message.content}</p>
                                            </div>
                                        </div>
                                        
                                        <Show 
                                            when={relatedAnswer()}
                                            fallback={
                                                <div class="ml-8 pl-4 border-l-2 border-gray-200">
                                                    <p class="text-sm text-gray-500 italic">En attente de réponse...</p>
                                                </div>
                                            }
                                        >
                                            {(answer) => (
                                                <div class="ml-8 pl-4 border-l-2 border-green-500 bg-green-50 rounded-r-lg p-3">
                                                    <p class="text-sm font-semibold text-green-700 mb-1">
                                                        Réponse de {answer().sender.username}
                                                    </p>
                                                    <p class="text-color-dark whitespace-pre-line">{answer().content}</p>
                                                </div>
                                            )}
                                        </Show>
                                    </div>
                                </Show>
                            );
                        }}
                    </For>
                </div>
            </Show>
        </div>
    );
};