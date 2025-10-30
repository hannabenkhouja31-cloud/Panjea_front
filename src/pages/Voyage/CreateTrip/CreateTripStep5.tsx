import { createSignal, For, Show } from "solid-js";
import { Camera, X } from "lucide-solid";
import { createUploadThing } from "../../../utils/uploadthing";
import { user } from "../../../stores/userStore";
import { createTemporaryTripMedia, deleteTemporaryTripMedia } from "../../../stores/tripStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface TemporaryMedia {
    id: string;
    url: string;
}

interface CreateTripStep5Props {
    currentStep: number;
    temporaryMedia: TemporaryMedia[];
    setTemporaryMedia: (media: TemporaryMedia[] | ((prev: TemporaryMedia[]) => TemporaryMedia[])) => void;
}

export const CreateTripStep5 = (props: CreateTripStep5Props) => {
    const [uploadError, setUploadError] = createSignal<string | null>(null);
    const [isUploading, setIsUploading] = createSignal(false);

    const { startUpload } = createUploadThing("tripMedia", {
        onClientUploadComplete: async (res) => {
            const newMedia: TemporaryMedia[] = [];

            for (const file of res) {
                const uploadedUrl = file.ufsUrl;
                
                if (!user.profile?.id) {
                    setUploadError("Utilisateur non connecté");
                    continue;
                }

                const result = await createTemporaryTripMedia(user.profile.id, uploadedUrl);
                
                if (result.success && result.data) {
                    newMedia.push({
                        id: result.data.id.toString(),
                        url: uploadedUrl
                    });
                } else {
                    setUploadError("Erreur lors de la sauvegarde temporaire");
                    
                    try {
                        await fetch(`${backendUrl}/api/uploadthing`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: uploadedUrl })
                        });
                    } catch (deleteError) {
                        console.error("Impossible de supprimer la photo sur UploadThing:", deleteError);
                    }
                }
            }

            if (newMedia.length > 0) {
                props.setTemporaryMedia((prev) => [...prev, ...newMedia]);
                setUploadError(null);
            }
            
            setIsUploading(false);
        },
        onUploadError: (error) => {
            if (error.message.includes("FileSizeMismatch") || error.message.includes("file size")) {
                setUploadError("Vous ne pouvez pas mettre des images qui dépassent 4 Mo");
            } else {
                setUploadError(`Erreur d'upload: ${error.message}`);
            }
            setIsUploading(false);
        },
        onUploadBegin: () => {
            setIsUploading(true);
            setUploadError(null);
        },
    });

    const handleFileSelect = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        const files = input.files;
        
        if (files && files.length > 0) {
            if (props.temporaryMedia.length + files.length > 10) {
                setUploadError("Vous ne pouvez pas ajouter plus de 10 photos");
                return;
            }

            setIsUploading(true);
            setUploadError(null);
            await startUpload(Array.from(files));
        }
    };

    const handleRemoveMedia = async (mediaId: string, url: string) => {
        if(url) {
            
        }

        if (!user.profile?.id) {
            setUploadError("Utilisateur non connecté");
            return;
        }

        const result = await deleteTemporaryTripMedia(mediaId, user.profile.id);
        
        if (result.success) {
            props.setTemporaryMedia((prev) => prev.filter(m => m.id !== mediaId));
        } else {
            setUploadError("Erreur lors de la suppression");
        }
    };

    return (
        <div class="w-full max-w-3xl mx-auto p-6">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <Camera size={32} class="text-color-main" />
                    <h3 class="text-2xl font-bold text-color-dark">Photos du voyage</h3>
                </div>
                <span class="text-gray-500 font-medium">Étape {props.currentStep}/5</span>
            </div>
            
            <div>
                <h4 class="text-xl font-bold text-color-dark mb-2">
                    Ajoutez vos plus belles photos
                </h4>
                <p class="text-gray-600 mb-6 text-base">
                    Des photos attrayantes donnent envie de vous rejoindre dans cette aventure ! (Maximum 10 photos)
                </p>

                <Show when={props.temporaryMedia.length === 0}>
                    <label class="border-4 border-dashed border-gray-300 rounded-2xl p-12 bg-gray-50 hover:bg-gray-100 hover:border-color-main transition-all cursor-pointer flex flex-col items-center justify-center">
                        <Camera size={64} class="text-gray-300 mb-4" />
                        <p class="text-lg font-semibold text-gray-600 mb-2">
                            Cliquez pour ajouter des photos
                        </p>
                        <p class="text-gray-500 text-sm">
                            Ou glissez-déposez vos images ici
                        </p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            class="hidden" 
                            onChange={handleFileSelect}
                            disabled={isUploading()}
                        />
                    </label>
                </Show>

                <Show when={props.temporaryMedia.length > 0}>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <For each={props.temporaryMedia}>
                            {(media) => (
                                <div class="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                                    <img 
                                        src={media.url} 
                                        alt="Photo du voyage" 
                                        class="w-full h-full object-cover block"
                                    />
                                    <button
                                        onClick={() => handleRemoveMedia(media.id, media.url)}
                                        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg z-10"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </For>
                    </div>

                    <Show when={props.temporaryMedia.length < 10}>
                        <label class="w-full py-4 px-6 border-2 border-color-main rounded-xl font-semibold text-color-main cursor-pointer hover:bg-color-main hover:text-white transition-all flex items-center justify-center gap-3">
                            <Camera size={24} />
                            Ajouter d'autres photos ({props.temporaryMedia.length}/10)
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                class="hidden" 
                                onChange={handleFileSelect}
                                disabled={isUploading()}
                            />
                        </label>
                    </Show>
                </Show>

                <Show when={isUploading()}>
                    <div class="mt-4 flex items-center justify-center gap-3 text-color-main">
                        <span class="loading loading-spinner loading-md"></span>
                        <span class="font-semibold">Upload en cours...</span>
                    </div>
                </Show>

                <Show when={uploadError()}>
                    <div class="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center">
                        {uploadError()}
                    </div>
                </Show>
            </div>
        </div>
    );
};

export default CreateTripStep5;