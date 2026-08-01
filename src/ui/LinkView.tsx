import { type HoverParent, Menu, type WorkspaceLeaf } from "obsidian";
import {
  memo,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { HOVER_LINK_ID } from "../main";
import type { FileEntity } from "../model/FileEntity";
import { removeBlockReference } from "../utils";
import type { LinkRendererProps } from "./types";

interface LinkViewProps extends LinkRendererProps {
  fileEntity: FileEntity;
}

type OpenLocation = "tab" | "split" | "window";

function LinkView({
  app,
  fileEntity,
  onClick,
  getPreview,
  getTitle,
}: LinkViewProps) {
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const dragging = useRef(false);
  const touchStart = useRef(0);
  const hoverParent = useRef<HoverParent>({ hoverPopover: null }).current;
  const isMobile = useRef(
    window.matchMedia("(pointer: coarse)").matches,
  ).current;

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all([
      getPreview(fileEntity, controller.signal),
      getTitle(fileEntity, controller.signal),
    ]).then(([nextPreview, nextTitle]) => {
      if (!controller.signal.aborted) {
        setPreview(nextPreview);
        setTitle(nextTitle);
      }
    });

    return () => controller.abort();
  }, [fileEntity, getPreview, getTitle]);

  const openFileWithOptions = useCallback(
    async (options?: OpenLocation) => {
      const file = app.metadataCache.getFirstLinkpathDest(
        removeBlockReference(fileEntity.linkText),
        fileEntity.sourcePath,
      );
      if (!file) return;

      const leaf: WorkspaceLeaf = app.workspace.getLeaf(options);
      await leaf.openFile(file);
    },
    [app, fileEntity],
  );

  const handleContextMenu = useCallback(
    (event: ReactMouseEvent | ReactTouchEvent) => {
      if ("button" in event && event.button !== 2) return;
      event.preventDefault();

      const point = "changedTouches" in event ? event.changedTouches[0] : event;
      const menu = new Menu();

      menu.addItem((item) =>
        item.setTitle("Open link").onClick(() => openFileWithOptions()),
      );
      menu.addItem((item) =>
        item
          .setTitle("Open in new tab")
          .onClick(() => openFileWithOptions("tab")),
      );
      menu.addItem((item) =>
        item
          .setTitle("Open to the right")
          .onClick(() => openFileWithOptions("split")),
      );
      menu.addItem((item) =>
        item
          .setTitle("Open in new window")
          .onClick(() => openFileWithOptions("window")),
      );
      menu.showAtPosition({ x: point.clientX, y: point.clientY });
    },
    [openFileWithOptions],
  );

  const handleTouchEnd = useCallback(
    async (event: ReactTouchEvent) => {
      const longPress = Date.now() - touchStart.current >= 500;
      if (longPress && !dragging.current) {
        handleContextMenu(event);
      } else if (!dragging.current) {
        await onClick(fileEntity);
      }
      touchStart.current = 0;
      dragging.current = false;
    },
    [fileEntity, handleContextMenu, onClick],
  );

  return (
    <div
      className="twohop-links-box"
      onTouchStart={() => {
        touchStart.current = Date.now();
      }}
      onTouchMove={() => {
        if (Date.now() - touchStart.current < 200) dragging.current = true;
      }}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        touchStart.current = 0;
        dragging.current = false;
      }}
      onMouseDown={(event) => {
        if (!isMobile && event.button === 1) event.preventDefault();
      }}
      onMouseUp={(event) => {
        if (isMobile) return;
        if (event.button === 1) void openFileWithOptions("tab");
        else if (event.button === 0 && !dragging.current)
          void onClick(fileEntity);
        dragging.current = false;
      }}
      onContextMenu={handleContextMenu}
      onMouseOver={(event) => {
        app.workspace.trigger("hover-link", {
          event: event.nativeEvent,
          source: HOVER_LINK_ID,
          hoverParent,
          targetEl: event.currentTarget,
          linktext: fileEntity.linkText,
          sourcePath: fileEntity.sourcePath,
        });
      }}
      draggable
      onDragStart={(event) => {
        const linkText = removeBlockReference(fileEntity.linkText);
        event.dataTransfer.setData("text/plain", `[[${linkText}]]`);
      }}
    >
      <div className="twohop-links-box-title">{title}</div>
      <div className="twohop-links-box-preview">
        {preview.match(/^(app|https?):\/\//) ? (
          <img src={preview} alt="Preview" />
        ) : (
          <div>{preview}</div>
        )}
      </div>
    </div>
  );
}

export default memo(LinkView);
