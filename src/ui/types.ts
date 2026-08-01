import type { App } from "obsidian";
import type { FileEntity } from "../model/FileEntity";

export type FileAction = (fileEntity: FileEntity) => Promise<void>;
export type FileContentLoader = (
  fileEntity: FileEntity,
  signal?: AbortSignal,
) => Promise<string>;

export interface LinkRendererProps {
  app: App;
  onClick: FileAction;
  getPreview: FileContentLoader;
  getTitle: FileContentLoader;
}
