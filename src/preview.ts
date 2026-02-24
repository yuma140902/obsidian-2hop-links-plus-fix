import { FileEntity } from "./model/FileEntity";
import { removeBlockReference } from "./utils";

export async function readPreview(fileEntity: FileEntity) {
  const linkText = removeBlockReference(fileEntity.linkText);

  if (fileEntity.linkText.match(/\.(avif|bmp|gif|jpeg|jpg|png|webp)$/i)) {
    const file = this.app.metadataCache.getFirstLinkpathDest(
      linkText,
      fileEntity.sourcePath
    );
    if (file) {
      const resourcePath = this.app.vault.getResourcePath(file);
      return resourcePath;
    }
  }

  if (
    fileEntity.linkText.match(/\.[a-z0-9_-]+$/i) &&
    !fileEntity.linkText.match(/\.(?:md|markdown|txt|text)$/i)
  ) {
    console.debug(`${fileEntity.linkText} is not a plain text file`);
    return "";
  }

  console.debug(
    `readPreview: getFirstLinkpathDest: ${linkText}, fileEntity.linkText=${fileEntity.linkText}
      sourcePath=${fileEntity.sourcePath}`
  );

  const file = this.app.metadataCache.getFirstLinkpathDest(
    linkText,
    fileEntity.sourcePath
  );
  if (file == null) {
    return "";
  }
  if (file.stat.size > 1000 * 1000) {
    // Ignore large file
    console.debug(`File too large(${fileEntity.linkText}): ${file.stat.size}`);
    return "";
  }
  const content = await this.app.vault.cachedRead(file);

  const combinedMatch = content.match(
    /<iframe[^>]*src="([^"]+)"[^>]*>|!\[[^\]]*\]\((https:\/\/www\.youtube\.com\/embed\/[^\)]+|https:\/\/www\.youtube\.com\/watch\?v=[^\)]+|https:\/\/youtu\.be\/[^\)]+)\)|!\[(?:[^\]]*?)\]\(((?!https?:\/\/twitter\.com\/)[^\)]+?(?:avif|bmp|gif|jpeg|jpg|png|webp))\)|!\[\[([^\]]+.(?:avif|bmp|gif|jpeg|jpg|png|webp))\]\]|image: "?\[\[([^\]]+(?:avif|bmp|gif|jpeg|jpg|png|webp))\]\]/
  );
  if (combinedMatch) {
    const iframeUrl = combinedMatch[1];
    const youtubeEmbedUrl = combinedMatch[2];
    const img = combinedMatch[3] || combinedMatch[4] || combinedMatch[5];
    if (iframeUrl) {
      const thumbnailUrl = getThumbnailUrlFromIframeUrl(iframeUrl);
      if (thumbnailUrl) {
        return thumbnailUrl;
      }
    } else if (youtubeEmbedUrl) {
      const youtubeThumbnailUrl = getThumbnailUrlFromIframeUrl(youtubeEmbedUrl);
      if (youtubeThumbnailUrl) {
        return youtubeThumbnailUrl;
      }
    } else if (img) {
      console.debug(`Found image: ${img}`);
      if (img.match(/^https?:\/\//)) {
        return img;
      } else {
        let img_ = img.trim();
        if (img_.startsWith("<") && img_.endsWith(">")) {
          img_ = img_.slice(1, -1);
        } else if (img_.includes("%")) {
          img_ = decodeURIComponent(img_);
        }
        const file = this.app.metadataCache.getFirstLinkpathDest(
          img_,
          fileEntity.sourcePath
        );
        console.debug(`Found image: ${img} = file=${file}`);
        if (file) {
          const resourcePath = this.app.vault.getResourcePath(file);
          console.debug(`Found image: ${img} resourcePath=${resourcePath}`);
          return resourcePath;
        }
      }
    }
  }

  const updatedContent = content.replace(/^(.*\n)?---[\s\S]*?---\n?/m, "");
  const lines = shortenExternalLinkInPreview(updatedContent).split(/\n/);
  return lines
    .filter((it: string) => {
      return it.match(/\S/) && !it.match(/^#/) && !it.match(/^https?:\/\//);
    })
    .slice(0, 6)
    .join("\n");
}

export function getThumbnailUrlFromIframeUrl(iframeUrl: string): string | null {
  const youtubeIdMatch = iframeUrl.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&]+)(?:\?[^?]+)?$|(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^?&]+)(?:\?[^?]+)?$|(?:https?:\/\/)?(?:youtu\.be\/)([^?&]+)(?:\?[^?]+)?$/
  );
  if (youtubeIdMatch) {
    const youtubeId =
      youtubeIdMatch[1] || youtubeIdMatch[2] || youtubeIdMatch[3];
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  }

  return null;
}

export function shortenExternalLinkInPreview(content: string): string {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return content.replace(regex, "[$1](...)");
}
