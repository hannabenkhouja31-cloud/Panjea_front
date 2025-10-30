import {
  generateSolidHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/solid';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

type UploadRouter = {
  profilePicture: any;
  tripMedia: any;
};

export const UploadButton = generateUploadButton<UploadRouter>({
  url: `${backendUrl}/api/uploadthing`,
});

export const UploadDropzone = generateUploadDropzone<UploadRouter>({
  url: `${backendUrl}/api/uploadthing`,
});

export const { createUploadThing } = generateSolidHelpers<UploadRouter>({
  url: `${backendUrl}/api/uploadthing`,
});