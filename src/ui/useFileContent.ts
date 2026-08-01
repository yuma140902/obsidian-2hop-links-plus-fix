import { useEffect, useState } from "react";
import type { FileEntity } from "../model/FileEntity";
import type { FileContentLoader } from "./types";

export function useFileContent(
  loader: FileContentLoader,
  fileEntity: FileEntity,
): string {
  const [content, setContent] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void loader(fileEntity, controller.signal)
      .then((nextContent) => {
        if (!controller.signal.aborted) setContent(nextContent);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Could not load link content", error);
          setContent("");
        }
      });

    return () => controller.abort();
  }, [fileEntity, loader]);

  return content;
}
