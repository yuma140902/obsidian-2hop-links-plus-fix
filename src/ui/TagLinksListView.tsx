import { memo, useEffect, useState } from "react";
import type { PropertiesLinks } from "../model/PropertiesLinks";
import LinkView from "./LinkView";
import type { LinkRendererProps } from "./types";
import { useObsidianIcon } from "./useObsidianIcon";

interface PropertiesLinksListViewProps extends LinkRendererProps {
  propertiesLinksList: PropertiesLinks[];
  displayedSectionCount: number;
  initialDisplayedEntitiesCount: number;
  resetRevision: number;
}

interface LinkSectionProps extends LinkRendererProps {
  propertiesLinks: PropertiesLinks;
  initialDisplayedEntitiesCount: number;
  resetRevision: number;
}

const LINK_SECTION = memo(function LinkSection({
  propertiesLinks,
  initialDisplayedEntitiesCount,
  resetRevision,
  ...linkProps
}: LinkSectionProps) {
  const [displayedEntitiesCount, setDisplayedEntitiesCount] = useState(
    initialDisplayedEntitiesCount,
  );
  const loadMoreRef = useObsidianIcon<HTMLButtonElement>("more-horizontal");

  useEffect(() => {
    void resetRevision;
    setDisplayedEntitiesCount(initialDisplayedEntitiesCount);
  }, [initialDisplayedEntitiesCount, resetRevision]);

  const heading = propertiesLinks.key
    ? `${propertiesLinks.key}: ${propertiesLinks.property}`
    : propertiesLinks.property;
  const headingClass = propertiesLinks.key
    ? `twohop-links-${propertiesLinks.key}-header`
    : "";

  return (
    <section className="twohop-links-section">
      <div
        className={`${headingClass} twohop-links-properties-header twohop-links-box`}
      >
        {heading}
      </div>
      {propertiesLinks.fileEntities
        .slice(0, displayedEntitiesCount)
        .map((fileEntity, index) => (
          <LinkView
            {...linkProps}
            fileEntity={fileEntity}
            key={`${propertiesLinks.property}${fileEntity.key()}${index}`}
          />
        ))}
      {propertiesLinks.fileEntities.length > displayedEntitiesCount && (
        <button
          ref={loadMoreRef}
          type="button"
          aria-label={`Load more links for ${heading}`}
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

function PropertiesLinksListView({
  propertiesLinksList,
  displayedSectionCount,
  ...sectionProps
}: PropertiesLinksListViewProps) {
  return (
    <div>
      {propertiesLinksList
        .slice(0, displayedSectionCount)
        .map((propertiesLinks) => (
          <LINK_SECTION
            {...sectionProps}
            key={`${propertiesLinks.key}:${propertiesLinks.property}`}
            propertiesLinks={propertiesLinks}
          />
        ))}
    </div>
  );
}

export default memo(PropertiesLinksListView);
