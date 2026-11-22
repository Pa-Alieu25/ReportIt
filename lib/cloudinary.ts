const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Uploads go through an unsigned preset. Allowed formats and a maximum
// image size are enforced by the preset itself in the Cloudinary console; the
// folder groups each user's photos so they can be audited or removed together.
//
// XMLHttpRequest (not fetch) so the UI can show real upload progress, which
// matters on slow connections.
export function uploadImageToCloudinary(
  localUri: string,
  userId: string,
  onProgress?: (fraction: number) => void
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(new Error('Photo upload is not configured. Please try again later.'));
  }

  const filename = localUri.split('/').pop() ?? 'photo.jpg';
  const extensionMatch = /\.(\w+)$/.exec(filename);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : 'jpg';

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: filename,
    type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
  } as unknown as Blob);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `reportit/reports/${userId}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.timeout = 120_000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) onProgress(event.loaded / event.total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (typeof data.secure_url === 'string') return resolve(data.secure_url);
          console.error('Cloudinary response missing secure_url:', data);
        } catch (error) {
          console.error('Cloudinary response was not JSON:', error);
        }
        return reject(new Error('Failed to upload photo. Please try again.'));
      }
      console.error('Cloudinary upload failed:', xhr.status, xhr.responseText);
      reject(
        new Error(
          xhr.status === 400
            ? // The preset rejects file types it doesn't allow (and Cloudinary rejects oversized files).
              'This photo could not be accepted. Please use a JPG or PNG photo and try again.'
            : 'Failed to upload photo. Please try again.'
        )
      );
    };

    const networkError = () =>
      reject(new Error('Could not reach the photo upload service. Check your connection and try again.'));
    xhr.onerror = networkError;
    xhr.ontimeout = networkError;

    xhr.send(formData);
  });
}
