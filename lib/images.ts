// Cloudinary can resize on the fly by inserting a transformation after
// "/upload/". Thumbnails then download a few KB instead of the full photo,
// which matters on slow and metered mobile data.
const UPLOAD_SEGMENT = '/image/upload/';

export function cloudinaryResized(url: string, width: number, height?: number): string {
  const index = url.indexOf(UPLOAD_SEGMENT);
  if (index === -1 || !url.startsWith('https://res.cloudinary.com/')) return url;

  const size = height ? `w_${width},h_${height},c_fill` : `w_${width},c_limit`;
  const transform = `${size},q_auto,f_auto/`;
  const splitAt = index + UPLOAD_SEGMENT.length;
  return url.slice(0, splitAt) + transform + url.slice(splitAt);
}
