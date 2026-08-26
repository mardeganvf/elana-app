import { supabase } from './supabase';

/**
 * Faz upload de um arquivo de imagem (File ou Blob) para o bucket 'user-media' do Supabase Storage.
 * Retorna a URL pública acessível da imagem.
 * Caso o upload falhe (ex: bucket ainda não criado), pode fazer fallback para base64.
 */
export async function uploadImageToStorage(
  file: File | Blob,
  folder: 'avatars' | 'family-photos' | 'community' = 'avatars',
  customFileName?: string
): Promise<string> {
  try {
    const fileExt = file instanceof File && file.name.includes('.') 
      ? file.name.split('.').pop() 
      : 'jpg';
    const fileName = customFileName || `${folder}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('user-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase Storage upload note (falling back if needed):', error.message);
      // Fallback para Base64 se o storage estiver bloqueado
      return await fileToBase64(file);
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('user-media')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Storage upload exception, using base64 fallback:', err);
    return await fileToBase64(file);
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
