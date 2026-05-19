// urlSafety.ts
//
// Valida e normaliza URLs antes de injetá-las em <iframe src={...}>.
// Endereça HIGH-04: ModuleContentList renderiza iframe com content_url sem
// nenhuma checagem, o que permite clickjacking, phishing visual e (em alguns
// navegadores antigos) escape de origem.

const ALLOWED_HOSTS = [
  // Vídeo
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "player.vimeo.com",
  "vimeo.com",
  // Apresentações e docs
  "docs.google.com",
  "drive.google.com",
  "slides.google.com",
  // Embeds educacionais comuns
  "codesandbox.io",
  "codepen.io",
  "replit.com",
  "stackblitz.com",
];

/**
 * Retorna a URL embed segura ou null se não for permitida.
 *
 * Para YouTube e Vimeo, normaliza URLs "watch" para a forma "/embed".
 */
export function getSafeEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.includes(host)) return null;

  // Normalizações.
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host.endsWith("youtube.com")) {
    const id = url.searchParams.get("v");
    if (id) {
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    // já é /embed/ID
    if (url.pathname.startsWith("/embed/")) {
      return `https://www.youtube-nocookie.com${url.pathname}`;
    }
    return null;
  }

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id)
      ? `https://player.vimeo.com/video/${id}`
      : null;
  }

  // Para Drive, Slides, sandboxes, retornamos a URL como está (já validamos o host).
  return url.toString();
}
