import { Show, createSignal } from "solid-js";
import { Camera, X } from "lucide-solid";
import { createUploadThing } from "../../utils/uploadthing";
import { updateProfilePicture, deleteProfilePicture, type UserProfile } from "../../stores/userStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface ProfileAvatarProps {
    profile: UserProfile | null;
    isEditing: boolean;
}

export const ProfileAvatar = (props: ProfileAvatarProps) => {
    const [uploadError, setUploadError] = createSignal<string | null>(null);
    const [isUploading, setIsUploading] = createSignal(false);

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

            if (props.profile?.profilePictureUrl) {
                const currentUrl = props.profile.profilePictureUrl;

                try {
                    await fetch(`${backendUrl}/api/uploadthing`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: currentUrl })
                    });
                } catch (error) {
                    console.error("Erreur lors de la suppression sur UploadThing:", error);
                }
            }

            await startUpload(Array.from(files));
        }
    };

    const handleDeletePhoto = async () => {
        const result = await deleteProfilePicture();
        if (!result.success) {
            setUploadError("Erreur lors de la suppression de la photo");
        } else {
            setUploadError(null);
        }
    };

    return (
        <div class="flex flex-col items-center gap-2 sm:gap-3">
            <div class="relative">
                <div class="avatar avatar-placeholder">
                    <Show
                        when={props.profile?.profilePictureUrl}
                        fallback={
                            <div class="bg-neutral text-neutral-content w-16 sm:w-24 rounded-full">
                                <span class="text-2xl sm:text-4xl">
                                    {props.profile?.username?.[0]?.toUpperCase() || "P"}
                                </span>
                            </div>
                        }
                    >
                        <div class="w-16 sm:w-24 rounded-full">
                            <img src={props.profile?.profilePictureUrl} alt={props.profile?.username} />
                        </div>
                    </Show>
                </div>

                <Show when={props.isEditing}>
                    <label
                        class="absolute bottom-0 right-0 bg-color-main text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 shadow-lg"
                        classList={{ "opacity-50 cursor-wait": isUploading() }}
                    >
                        <Camera size={14} class="sm:w-[18px] sm:h-[18px]" />
                        <input
                            type="file"
                            accept="image/*"
                            class="hidden"
                            onChange={handleFileSelect}
                            disabled={isUploading()}
                        />
                    </label>

                    <Show when={props.profile?.profilePictureUrl}>
                        <button
                            onClick={handleDeletePhoto}
                            class="absolute top-0 right-0 bg-red-500 text-white p-1 sm:p-1.5 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 shadow-lg"
                            title="Supprimer la photo"
                        >
                            <X size={12} class="sm:w-[14px] sm:h-[14px]" />
                        </button>
                    </Show>
                </Show>

                <Show when={isUploading()}>
                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <span class="loading loading-spinner loading-sm sm:loading-md text-white"></span>
                    </div>
                </Show>
            </div>

            <Show when={uploadError()}>
                <div class="max-w-xs">
                    <p class="text-red-500 text-xs sm:text-sm font-medium text-center">{uploadError()}</p>
                </div>
            </Show>
        </div>
    );
};