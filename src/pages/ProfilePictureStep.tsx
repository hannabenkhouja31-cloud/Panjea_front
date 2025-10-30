import { createSignal } from "solid-js";
import { Camera, Plane, MapPin, Compass, Globe, Mountain } from "lucide-solid";
import { createUploadThing } from "../utils/uploadthing";
import { updateProfilePicture, user } from "../stores/userStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const ProfilePictureStep = () => {
    const [uploadError, setUploadError] = createSignal<string | null>(null);
    const [isUploading, setIsUploading] = createSignal(false);
    const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);

    const { startUpload } = createUploadThing("profilePicture", {
        onClientUploadComplete: async (res) => {
            const uploadedUrl = res[0].ufsUrl;
            
            const result = await updateProfilePicture(uploadedUrl);
            
            if (!result.success) {
                setUploadError("Erreur lors de la sauvegarde de la photo");
                
                try {
                    await fetch(`${backendUrl}/api/uploadthing`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: uploadedUrl })
                    });
                } catch (deleteError) {
                    console.error("Impossible de supprimer la photo sur UploadThing:", deleteError);
                }
            } else {
                setUploadError(null);
                setPreviewUrl(uploadedUrl);
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
            setIsUploading(true);
            setUploadError(null);
            await startUpload(Array.from(files));
        }
    };

    const handleFinish = () => {
         window.location.href = "/voyage"; 
    };

    return (
        <div class="flex-1 flex items-center justify-center bg-color-light px-6 py-20 relative overflow-hidden">
            <MapPin class="absolute top-16 left-16 text-color-secondary opacity-50" size={40} />
            <Compass class="absolute top-32 right-24 text-color-main opacity-50" size={44} />
            <Globe class="absolute bottom-28 left-24 text-color-secondary opacity-50" size={42} />
            <Mountain class="absolute bottom-16 right-20 text-color-main opacity-50" size={48} />

            <div class="bg-white rounded-2xl shadow-xl p-16 w-full max-w-3xl">
                <div class="text-center mb-12">
                    <h1 class="text-2xl font-bold text-color-dark mb-3 flex items-center justify-center gap-4">                        Booste ton profil avec ta plus belle photo de voyage
                        <Plane class="text-color-main animate-bounce" size={48} />
                    </h1>
                </div>

                <div class="flex flex-col items-center gap-8 mb-12">
                    <label class="relative cursor-pointer group" classList={{ "cursor-wait": isUploading() }}>
                        {previewUrl() || user.profile?.profilePictureUrl ? (
                            <div class="w-80 h-80 rounded-full overflow-hidden border-4 border-color-main shadow-xl">
                                <img 
                                    src={previewUrl() || user.profile?.profilePictureUrl} 
                                    alt="Profile" 
                                    class="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div class="w-80 h-80 rounded-full bg-color-main flex items-center justify-center shadow-xl">
                                <span class="text-white text-9xl font-bold">
                                    {user.profile?.username?.[0]?.toUpperCase() || "P"}
                                </span>
                            </div>
                        )}

                        <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-50">
                            <Camera class="text-white" size={80} />
                        </div>

                        {isUploading() && (
                            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                <span class="loading loading-spinner loading-xl text-white"></span>
                            </div>
                        )}

                        <input 
                            type="file" 
                            accept="image/*" 
                            class="hidden" 
                            onChange={handleFileSelect}
                            disabled={isUploading()}
                        />
                    </label>

                    {uploadError() && (
                        <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-base w-full text-center">
                            {uploadError()}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleFinish}
                    class="w-full bg-color-secondary text-white py-5 text-xl rounded-xl font-bold hover:bg-gradient-main transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    Finir l'inscription
                </button>
            </div>
        </div>
    );
};

export default ProfilePictureStep;