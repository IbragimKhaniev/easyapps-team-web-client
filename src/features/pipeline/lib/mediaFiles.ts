/** Что принимают зоны загрузки конвейера: клип — видео, кадр и лист персонажа — картинка. */
export const VIDEO_ACCEPT = 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v';
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

const VIDEO_FILE = /\.(mp4|mov|webm|m4v)$/i;
const IMAGE_FILE = /\.(jpe?g|png|webp)$/i;

export const isVideoFile = (file: File): boolean => file.type.startsWith('video/') || VIDEO_FILE.test(file.name);
export const isImageFile = (file: File): boolean => file.type.startsWith('image/') || IMAGE_FILE.test(file.name);
