import { supabase } from './supabase';

/**
 * Reduz e comprime uma imagem no navegador antes do upload para evitar travamentos
 * e garantir carregamento instantâneo.
 */
function compressImage(file: File | Blob, maxWidth = 400, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Converte DataURL Base64 para Blob para upload real
 */
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Faz upload de imagem para o Supabase Storage ou retorna Base64 otimizado
 */
export async function uploadImageToStorage(
  file: File | Blob,
  folder: 'avatars' | 'family-photos' | 'community' = 'avatars',
  customFileName?: string
): Promise<string> {
  try {
    // 1. Comprimir localmente primeiro para ficar ultra leve
    const compressedBase64 = await compressImage(file);
    if (!compressedBase64) return '';

    const fileName = customFileName || `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.jpg`;
    const blobToUpload = dataURLtoBlob(compressedBase64);

    const { data, error } = await supabase.storage
      .from('user-media')
      .upload(fileName, blobToUpload, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Storage upload note, using optimized compressed image:', error.message);
      return compressedBase64;
    }

    const { data: publicUrlData } = supabase.storage
      .from('user-media')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl || compressedBase64;
  } catch (err) {
    console.error('Storage upload exception, using compressed fallback:', err);
    return await compressImage(file);
  }
}

/**
 * Converte File/Blob para Base64 como fallback seguro.
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
