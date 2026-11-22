import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Longest side after resizing. Plenty for a council to see the problem,
// and a typical phone photo drops from 3–5 MB to roughly 200–400 KB.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.7;

type PickedPhoto = { uri: string; width?: number; height?: number };

/**
 * Shrinks and re-encodes a picked photo as JPEG before upload, to save the
 * user's mobile data and make uploads work on slow connections. Also turns
 * HEIC/PNG into JPEG. Falls back to the original if processing fails.
 */
export async function preparePhotoForUpload(photo: PickedPhoto): Promise<string> {
  try {
    const context = ImageManipulator.manipulate(photo.uri);
    const { width = 0, height = 0 } = photo;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      context.resize(width >= height ? { width: MAX_DIMENSION } : { height: MAX_DIMENSION });
    }
    const image = await context.renderAsync();
    const result = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
    return result.uri;
  } catch (error) {
    console.error('Could not compress photo, uploading original:', error);
    return photo.uri;
  }
}
