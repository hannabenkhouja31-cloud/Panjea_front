import { Show, For, type Accessor } from "solid-js";
import { Image, Camera, X } from "lucide-solid";

interface TripPhotosProps {
    media: any[];
    isEditing: boolean;
    allEditMedia: () => any[];
    isUploadingMedia: Accessor<boolean>;
    uploadError: Accessor<string | null>;
    onFileSelect: (e: Event) => void;
    onMoveLeft: (index: number) => void;
    onMoveRight: (index: number) => void;
    onRemove: (mediaId: string, isTemporary: boolean) => void;
}

export const TripPhotos = (props: TripPhotosProps) => {
    return (
        <div class="bg-white rounded-2xl shadow-md p-6">
            <h2 class="text-xl font-bold text-color-dark flex items-center gap-2 mb-4">
                <Image size={24} class="text-color-main" />
                Photos du voyage
            </h2>
            
            <Show when={!props.isEditing}>
                <Show 
                    when={props.media && props.media.length > 0}
                    fallback={
                        <div class="text-center py-8">
                            <p class="text-color-dark opacity-50">Aucune photo pour le moment</p>
                        </div>
                    }
                >
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <For each={props.media}>
                            {(media: any) => (
                                <div class="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-white">
                                    <img 
                                        src={media.url} 
                                        alt="Photo du voyage" 
                                        class="w-full h-full object-cover block"
                                    />
                                </div>
                            )}
                        </For>
                    </div>
                </Show>
            </Show>

            <Show when={props.isEditing}>
                <div>
                    <Show when={props.allEditMedia().length > 0}>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <For each={props.allEditMedia()}>
                                {(media, index) => (
                                    <div class="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-white">
                                        <img 
                                            src={media.url} 
                                            alt="Photo du voyage" 
                                            class="w-full h-full object-cover block"
                                        />
                                        <div class="absolute inset-0 group-hover:bg-black/60 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                                            <div class="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-300">
                                                <button
                                                    onClick={() => props.onMoveLeft(index())}
                                                    disabled={index() === 0}
                                                    class="bg-white text-color-main p-2 rounded-full hover:bg-color-main hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => props.onMoveRight(index())}
                                                    disabled={index() === props.allEditMedia().length - 1}
                                                    class="bg-white text-color-main p-2 rounded-full hover:bg-color-main hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => props.onRemove(media.id, media.isTemporary)}
                                                class="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all pointer-events-auto"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <Show when={index() === 0}>
                                            <div class="absolute top-2 left-2 bg-color-main px-2 py-1 rounded-full">
                                                <span class="text-xs font-bold text-white">Photo principale</span>
                                            </div>
                                        </Show>
                                    </div>
                                )}
                            </For>
                        </div>
                    </Show>

                    <Show when={props.allEditMedia().length < 10}>
                        <label class="w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-color-main transition-all cursor-pointer flex items-center justify-center gap-3 text-gray-500 hover:text-color-main">
                            <Camera size={24} />
                            <span>Ajouter des photos ({props.allEditMedia().length}/10)</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                class="hidden" 
                                onChange={props.onFileSelect}
                                disabled={props.isUploadingMedia()}
                            />
                        </label>
                    </Show>

                    <Show when={props.isUploadingMedia()}>
                        <div class="mt-4 flex items-center justify-center gap-3 text-color-main">
                            <span class="loading loading-spinner loading-md"></span>
                            <span class="font-semibold">Upload en cours...</span>
                        </div>
                    </Show>

                    <Show when={props.uploadError()}>
                        <div class="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center">
                            {props.uploadError()}
                        </div>
                    </Show>
                </div>
            </Show>
        </div>
    );
};