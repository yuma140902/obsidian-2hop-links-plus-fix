import { memo } from "react";
import type { FileEntity } from "../model/FileEntity";
import LinkView from "./LinkView";
import type { LinkRendererProps } from "./types";
import { useObsidianIcon } from "./useObsidianIcon";

interface ConnectedLinksViewProps extends LinkRendererProps {
  fileEntities: FileEntity[];
  displayedBoxCount: number;
  onLoadMore: () => void;
  title: string;
  className: string;
}

function ConnectedLinksView({
  fileEntities,
  displayedBoxCount,
  onLoadMore,
  title,
  className,
  ...linkProps
}: ConnectedLinksViewProps) {
  const loadMoreRef = useObsidianIcon<HTMLButtonElement>("more-horizontal");

  if (fileEntities.length === 0) return null;

  return (
    <section className={`twohop-links-section ${className}`}>
      <div className="twohop-links-box twohop-links-connected-links-header">
        {title}
      </div>
      {fileEntities.slice(0, displayedBoxCount).map((fileEntity) => (
        <LinkView
          {...linkProps}
          fileEntity={fileEntity}
          key={fileEntity.key()}
        />
      ))}
      {fileEntities.length > displayedBoxCount && (
        <button
          ref={loadMoreRef}
          type="button"
          aria-label="Load more links"
          onClick={onLoadMore}
          className="load-more-button twohop-links-box"
        />
      )}
    </section>
  );
}

export default memo(ConnectedLinksView);
