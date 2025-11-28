import { createSignal } from "solid-js";
import { Camera, Plane, MapPin, Compass, Globe, Mountain } from "lucide-solid";
import { createUploadThing } from "../../utils/uploadthing";
import { updateProfilePicture, user } from "../../stores/userStore";

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
        <div class="flex-1 flex items-center justify-center bg-color-light px-4 py-10 sm:py-20 relative overflow-hidden min-h-[80vh]">
            {/* Background Icons - Hidden on mobile, low z-index */}
            <MapPin class="hidden sm:block absolute top-16 left-16 text-color-secondary opacity-30 z-0 pointer-events-none" size={40} />
            <Compass class="hidden sm:block absolute top-32 right-24 text-color-main opacity-30 z-0 pointer-events-none" size={44} />
            <Globe class="hidden sm:block absolute bottom-28 left-24 text-color-secondary opacity-30 z-0 pointer-events-none" size={42} />
            <Mountain class="hidden sm:block absolute bottom-16 right-20 text-color-main opacity-30 z-0 pointer-events-none" size={48} />

            <div class="bg-white rounded-2xl shadow-xl py-8 px-6 sm:p-12 w-full max-w-xl relative z-10">
                <div class="text-center mb-8 sm:mb-10">
                    <h1 class="text-xl sm:text-3xl font-bold text-color-dark mb-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                        <span>Ta plus belle photo</span>
                        <Plane class="text-color-main animate-bounce hidden sm:block" size={32} />
                    </h1>
                    <p class="text-gray-500 text-sm sm:text-lg">Booste ton profil voyageur</p>
                </div>

                <div class="flex flex-col items-center gap-6 sm:gap-8 mb-8 sm:mb-10">
                    <label class="relative cursor-pointer group" classList={{ "cursor-wait": isUploading() }}>
                        {previewUrl() || user.profile?.profilePictureUrl ? (
                            <div class="w-40 h-40 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-color-main shadow-xl mx-auto">
                                <img
                                    src={previewUrl() || user.profile?.profilePictureUrl}
                                    alt="Profile"
                                    class="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div class="w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-color-main flex items-center justify-center shadow-xl mx-auto">
                                <span class="text-white text-5xl sm:text-8xl font-bold">
                                    {user.profile?.username?.[0]?.toUpperCase() || "P"}
                                </span>
                            </div>
                        )}

                        <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-50 w-40 h-40 sm:w-64 sm:h-64 mx-auto">
                            <Camera class="text-white" size={48} />
                        </div>

                        {isUploading() && (
                            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full w-40 h-40 sm:w-64 sm:h-64 mx-auto">
                                <span class="loading loading-spinner loading-lg text-white"></span>
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
                        <div class="bg-red-50 border border-red-200 text-red-600 p-3 sm:p-4 rounded-xl text-sm sm:text-base w-full text-center">
                            {uploadError()}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleFinish}
                    class="w-full bg-color-secondary text-white py-3 sm:py-4 text-base sm:text-xl rounded-xl font-bold hover:bg-gradient-main transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    Finir l'inscription
                </button>
            </div>
        </div>
    );
};

export default ProfilePictureStep;