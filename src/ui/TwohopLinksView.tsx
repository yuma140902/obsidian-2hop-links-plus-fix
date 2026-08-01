import { memo, useEffect, useState } from "react";
import type { TwohopLink } from "../model/TwohopLink";
import LinkView from "./LinkView";
import type { LinkRendererProps } from "./types";
import { useObsidianIcon } from "./useObsidianIcon";

interface TwohopLinksViewProps extends LinkRendererProps {
  twoHopLinks: TwohopLink[];
  displayedSectionCount: number;
  initialDisplayedEntitiesCount: number;
}

interface LinkSectionProps extends LinkRendererProps {
  link: TwohopLink;
  initialDisplayedEntitiesCount: number;
}

const LINK_SECTION = memo(function LinkSection({
  link,
  initialDisplayedEntitiesCount,
  onClick,
  getTitle,
  ...linkProps
}: LinkSectionProps) {
  const [displayedEntitiesCount, setDisplayedEntitiesCount] = useState(
    initialDisplayedEntitiesCount,
  );
  const [title, setTitle] = useState("");
  const loadMoreRef = useObsidianIcon<HTMLButtonElement>("more-horizontal");

  useEffect(() => {
    const controller = new AbortController();
    void getTitle(link.link, controller.signal).then((nextTitle) => {
      if (!controller.signal.aborted) setTitle(nextTitle);
    });
    return () => controller.abort();
  }, [getTitle, link.link]);

  return (
    <section className="twohop-links-section twohop-links-resolved">
      <button
        type="button"
        className="twohop-links-twohop-header twohop-links-box"
        onClick={() => void onClick(link.link)}
      >
        {title}
      </button>
      {link.fileEntities.slice(0, displayedEntitiesCount).map((fileEntity) => (
        <LinkView
          {...linkProps}
          onClick={onClick}
          getTitle={getTitle}
          fileEntity={fileEntity}
          key={`${link.link.linkText}${fileEntity.key()}`}
        />
      ))}
      {link.fileEntities.length > displayedEntitiesCount && (
        <button
          ref={loadMoreRef}
          type="button"
          aria-label={`Load more links for ${title}`}
          onClick={() =>
            setDisplayedEntitiesCount(
              (count) => count + initialDisplayedEntitiesCount,
            )
          }
          className="load-more-button twohop-links-box"
        />
      )}
    </section>
  );
});

function TwohopLinksView({
  twoHopLinks,
  displayedSectionCount,
  ...sectionProps
}: TwohopLinksViewProps) {
  return (
    <div>
      {twoHopLinks.slice(0, displayedSectionCount).map((link) => (
        <LINK_SECTION {...sectionProps} key={link.link.key()} link={link} />
      ))}
    </div>
  );
}

export default memo(TwohopLinksView);
