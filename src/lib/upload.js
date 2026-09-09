import { supabase, supabaseConfigurado } from './supabase'

export const MAX_BYTES = 3 * 1024 * 1024 // 3 MB
export const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp']
export const DICA_IMAGEM = 'JPG, PNG ou WebP · proporção ~16:10 · até 3 MB · ideal 1200×750 px'

const BUCKET = 'eventos'

/** Valida o arquivo escolhido. Retorna string de erro ou null se estiver ok. */
export function validarImagem(file) {
  if (!file) return 'Escolha um arquivo de imagem.'
  if (!TIPOS_OK.includes(file.type)) return 'Formato não aceito. Use JPG, PNG ou WebP.'
  if (file.size > MAX_BYTES) return 'A imagem passa de 3 MB. Reduza o tamanho e tente de novo.'
  return null
}

function extensao(file) {
  return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' })[file.type] || 'jpg'
}

/**
 * Envia a imagem para o Storage do Supabase e devolve a URL pública.
 * Sem Supabase (modo demonstração), devolve um data URL local só para pré-visualização.
 */
export async function enviarImagem(file) {
  const erro = validarImagem(file)
  if (erro) throw new Error(erro)

  if (!supabaseConfigurado) {
    return await lerComoDataURL(file) // some ao recarregar — serve só para o preview
  }

  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao(file)}`
  const { error } = await supabase.storage.from(BUCKET).upload(nome, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    throw new Error(
      /bucket/i.test(error.message)
        ? 'O armazenamento de imagens ainda não foi configurado no Supabase.'
        : `Não deu para enviar a imagem: ${error.message}`,
    )
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nome)
  return data.publicUrl
}

function lerComoDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    fr.readAsDataURL(file)
  })
}
