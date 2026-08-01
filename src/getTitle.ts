import type { App } from "obsidian";
import type { FileEntity } from "./model/FileEntity";
import type { TwohopPluginSettings } from "./settings/TwohopSettingTab";
import { removeBlockReference } from "./utils";

export async function getTitle(
  app: App,
  settings: TwohopPluginSettings,
  fileEntity: FileEntity,
  signal?: AbortSignal,
): Promise<string> {
  if (signal?.aborted) return "";
  const linkText = removeBlockReference(fileEntity.linkText);

  if (!settings.frontmatterPropertyKeyAsTitle) return linkText;
  const file = app.metadataCache.getFirstLinkpathDest(
    linkText,
    fileEntity.sourcePath,
  );

  if (file == null) return linkText;
  if (!file.extension?.match(/^(md|markdown)$/)) return linkText;

  const metadata = app.metadataCache.getFileCache(file);

  if (!metadata.frontmatter?.[settings.frontmatterPropertyKeyAsTitle])
    return linkText;

  const title = metadata.frontmatter[settings.frontmatterPropertyKeyAsTitle];
  return String(title);
}
