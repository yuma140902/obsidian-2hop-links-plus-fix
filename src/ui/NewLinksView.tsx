import { memo } from "react";
import type { FileEntity } from "../model/FileEntity";
import LinkView from "./LinkView";
import type { LinkRendererProps } from "./types";
import { useObsidianIcon } from "./useObsidianIcon";

interface NewLinksViewProps extends LinkRendererProps {
  fileEntities: FileEntity[];
  displayedBoxCount: number;
  onLoadMore: () => void;
}

function NewLinksView({
  fileEntities,
  displayedBoxCount,
  onLoadMore,
  ...linkProps
}: NewLinksViewProps) {
  const loadMoreRef = useObsidianIcon<HTMLDivElement>("more-horizontal");

  if (fileEntities.length === 0) return null;

  return (
    <section className="twohop-links-section">
      <div className="twohop-links-box twohop-links-new-links-header">
        New links
      </div>
      {fileEntities.slice(0, displayedBoxCount).map((fileEntity) => (
        <LinkView
          {...linkProps}
          fileEntity={fileEntity}
          key={fileEntity.key()}
        />
      ))}
      {displayedBoxCount < fileEntities.length && (
        <div
          ref={loadMoreRef}
          onClick={onLoadMore}
          className="load-more-button twohop-links-box"
        />
      )}
    </section>
  );
}

export default memo(NewLinksView);
