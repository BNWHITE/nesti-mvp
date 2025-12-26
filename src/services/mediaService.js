import { supabase } from '../lib/supabaseClient';

/**
 * Service pour gérer l'upload et le stockage des médias (photos et vidéos)
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

/**
 * Valider un fichier avant upload
 */
export function validateFile(file, type = 'image') {
  const allowedTypes = type === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  
  if (!file) {
    return { valid: false, error: 'Aucun fichier sélectionné' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Le fichier est trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Type de fichier non supporté: ${file.type}` };
  }

  return { valid: true, error: null };
}

/**
 * Uploader une photo
 */
export async function uploadPhoto(file, userId) {
  try {
    const validation = validateFile(file, 'image');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    return { url: publicUrl, path: fileName, error: null };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return { url: null, path: null, error };
  }
}

/**
 * Uploader une vidéo
 */
export async function uploadVideo(file, userId) {
  try {
    const validation = validateFile(file, 'video');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    return { url: publicUrl, path: fileName, error: null };
  } catch (error) {
    console.error('Error uploading video:', error);
    return { url: null, path: null, error };
  }
}

/**
 * Uploader un avatar
 */
export async function uploadAvatar(file, userId) {
  try {
    const validation = validateFile(file, 'image');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `avatars/${userId}.${fileExt}`;

    // Supprimer l'ancien avatar s'il existe
    await supabase.storage
      .from('photos')
      .remove([`avatars/${userId}.jpg`, `avatars/${userId}.png`, `avatars/${userId}.jpeg`]);

    const { error } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    return { url: publicUrl, path: fileName, error: null };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { url: null, path: null, error };
  }
}

/**
 * Supprimer un fichier
 */
export async function deleteMedia(path, bucket = 'photos') {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting media:', error);
    return { success: false, error };
  }
}

/**
 * Compresser une image côté client (pour réduire la taille)
 */
export function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
