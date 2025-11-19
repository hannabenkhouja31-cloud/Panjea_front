import { createSignal, createEffect } from "solid-js";
import { createUploadThing } from "../../../../utils/uploadthing";
import { user } from "../../../../stores/userStore";
import { createTemporaryTripMedia, deleteTemporaryTripMedia, deleteTripMedia, trip, updateTripMediaPositions } from "../../../../stores/tripStore";


const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useTripMedia = (isEditing: () => boolean) => {
    const [editMedia, setEditMedia] = createSignal<any[]>([]);
    const [temporaryEditMedia, setTemporaryEditMedia] = createSignal<any[]>([]);
    const [uploadError, setUploadError] = createSignal<string | null>(null);
    const [isUploadingMedia, setIsUploadingMedia] = createSignal(false);
    const [deletedMediaIds, setDeletedMediaIds] = createSignal<string[]>([]);

    const { startUpload } = createUploadThing("tripMedia", {
        onClientUploadComplete: async (res) => {
            const newMedia: any[] = [];

            for (const file of res) {
                const uploadedUrl = file.ufsUrl;
                
                if (!user.profile?.id) {
                    setUploadError("Utilisateur non connecté");
                    continue;
                }

                const result = await createTemporaryTripMedia(user.profile.id, uploadedUrl);
                
                if (result.success && result.data) {
                    newMedia.push({
                        id: result.data.id,
                        url: uploadedUrl,
                        isTemporary: true
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
                setTemporaryEditMedia((prev) => [...prev, ...newMedia]);
                setUploadError(null);
            }
            
            setIsUploadingMedia(false);
        },
        onUploadError: (error) => {
            if (error.message.includes("FileSizeMismatch") || error.message.includes("file size")) {
                setUploadError("Vous ne pouvez pas mettre des images qui dépassent 4 Mo");
            } else {
                setUploadError(`Erreur d'upload: ${error.message}`);
            }
            setIsUploadingMedia(false);
        },
        onUploadBegin: () => {
            setIsUploadingMedia(true);
            setUploadError(null);
        },
    });

    createEffect(() => {
        if (isEditing() && trip.currentTrip) {
            setEditMedia([...((trip.currentTrip as any).media || [])]);
            setTemporaryEditMedia([]);
            setDeletedMediaIds([]);
        }
    });

    const handleFileSelectEdit = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        const files = input.files;
        
        if (files && files.length > 0) {
            const totalMedia = editMedia().length + temporaryEditMedia().length;
            if (totalMedia + files.length > 10) {
                setUploadError("Vous ne pouvez pas ajouter plus de 10 photos");
                return;
            }

            setIsUploadingMedia(true);
            setUploadError(null);
            await startUpload(Array.from(files));
        }
    };

    const handleRemoveExistingMedia = (mediaId: string) => {
        setDeletedMediaIds((prev) => [...prev, mediaId]);
    };

    const handleRemoveTemporaryMedia = async (mediaId: string) => {
        if (!user.profile?.id) {
            setUploadError("Utilisateur non connecté");
            return;
        }

        const result = await deleteTemporaryTripMedia(mediaId, user.profile.id);
        
        if (result.success) {
            setTemporaryEditMedia((prev) => prev.filter(m => m.id !== mediaId));
        } else {
            setUploadError("Erreur lors de la suppression");
        }
    };

    const moveMediaLeft = (index: number) => {
        if (index === 0) return;
        
        const allMedia = [...editMedia(), ...temporaryEditMedia()];
        [allMedia[index], allMedia[index - 1]] = [allMedia[index - 1], allMedia[index]];
        
        const existingCount = editMedia().length;
        setEditMedia(allMedia.slice(0, existingCount));
        setTemporaryEditMedia(allMedia.slice(existingCount));
    };

    const moveMediaRight = (index: number) => {
        const allMedia = [...editMedia(), ...temporaryEditMedia()];
        if (index === allMedia.length - 1) return;
        
        [allMedia[index], allMedia[index + 1]] = [allMedia[index + 1], allMedia[index]];
        
        const existingCount = editMedia().length;
        setEditMedia(allMedia.slice(0, existingCount));
        setTemporaryEditMedia(allMedia.slice(existingCount));
    };

    const allEditMedia = () => {
        const existing = editMedia().filter(m => !deletedMediaIds().includes(m.id));
        return [...existing, ...temporaryEditMedia()];
    };

    const hasMediaChanges = () => {
        if (!trip.currentTrip) return false;
        
        const currentMedia = (trip.currentTrip as any).media || [];
        const editingMedia = allEditMedia();
        
        if (currentMedia.length !== editingMedia.length) return true;
        
        if (temporaryEditMedia().length > 0) return true;
        
        for (let i = 0; i < currentMedia.length; i++) {
            if (currentMedia[i].id !== editingMedia[i].id) return true;
        }
        
        return false;
    };

    const saveMediaChanges = async () => {
        const allMedia = allEditMedia();

        for (const mediaId of deletedMediaIds()) {
            const result = await deleteTripMedia(mediaId);
            if (!result.success) {
                setUploadError("Erreur lors de la suppression d'une photo");
                return false;
            }
        }

        const positionUpdates = allMedia
            .filter(media => !media.isTemporary)
            .map((media, index) => ({
                id: String(media.id),
                position: index + 1
            }));

        if (positionUpdates.length > 0) {
            const posResult = await updateTripMediaPositions(positionUpdates);
            if (!posResult.success) {
                setUploadError("Erreur lors de la mise à jour des positions");
                return false;
            }
        }

        return true;
    };

    return {
        editMedia,
        temporaryEditMedia,
        uploadError,
        isUploadingMedia,
        allEditMedia,
        handleFileSelectEdit,
        handleRemoveExistingMedia,
        handleRemoveTemporaryMedia,
        moveMediaLeft,
        moveMediaRight,
        saveMediaChanges,
        hasMediaChanges,
        setUploadError
    };
};