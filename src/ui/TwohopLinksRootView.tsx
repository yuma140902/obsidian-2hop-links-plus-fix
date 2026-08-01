import { useState } from "react";
import type { FileEntity } from "../model/FileEntity";
import type { PropertiesLinks } from "../model/PropertiesLinks";
import type { TwohopLink } from "../model/TwohopLink";
import ConnectedLinksView from "./ConnectedLinksView";
import NewLinksView from "./NewLinksView";
import PropertiesLinksListView from "./TagLinksListView";
import TwohopLinksView from "./TwohopLinksView";
import type { LinkRendererProps } from "./types";
import { useObsidianIcon } from "./useObsidianIcon";

interface TwohopLinksRootViewProps extends LinkRendererProps {
  forwardConnectedLinks: FileEntity[];
  newLinks: FileEntity[];
  backwardConnectedLinks: FileEntity[];
  twoHopLinks: TwohopLink[];
  tagLinksList: PropertiesLinks[];
  frontmatterKeyLinksList: PropertiesLinks[];
  showForwardConnectedLinks: boolean;
  showBackwardConnectedLinks: boolean;
  showTwohopLinks: boolean;
  showNewLinks: boolean;
  showTagsLinks: boolean;
  showPropertiesLinks: boolean;
  autoLoadTwoHopLinks: boolean;
  initialBoxCount: number;
  initialSectionCount: number;
}

type Category =
  | "forwardConnectedLinks"
  | "backwardConnectedLinks"
  | "twoHopLinks"
  | "newLinks"
  | "tagLinksList"
  | "frontmatterKeyLinksList";

const CATEGORIES: Category[] = [
  "forwardConnectedLinks",
  "backwardConnectedLinks",
  "twoHopLinks",
  "newLinks",
  "tagLinksList",
  "frontmatterKeyLinksList",
];

function initialCounts(value: number): Record<Category, number> {
  return Object.fromEntries(
    CATEGORIES.map((category) => [category, value]),
  ) as Record<Category, number>;
}

export default function TwohopLinksRootView(props: TwohopLinksRootViewProps) {
  const [displayedBoxCount, setDisplayedBoxCount] = useState(() =>
    initialCounts(props.initialBoxCount),
  );
  const [displayedSectionCount, setDisplayedSectionCount] = useState(() =>
    initialCounts(props.initialSectionCount),
  );
  const [isLoaded, setIsLoaded] = useState(props.autoLoadTwoHopLinks);
  const loadMoreRef = useObsidianIcon<HTMLButtonElement>("more-horizontal");

  const {
    forwardConnectedLinks,
    backwardConnectedLinks,
    twoHopLinks,
    newLinks,
    tagLinksList,
    frontmatterKeyLinksList,
    initialBoxCount,
    initialSectionCount,
  } = props;

  const loadMoreBoxes = (category: Category) => {
    setDisplayedBoxCount((counts) => ({
      ...counts,
      [category]: counts[category] + initialBoxCount,
    }));
  };
  const loadMoreSections = (category: Category) => {
    setDisplayedSectionCount((counts) => ({
      ...counts,
      [category]: counts[category] + initialSectionCount,
    }));
  };
  const linkProps: LinkRendererProps = {
    app: props.app,
    onClick: props.onClick,
    getPreview: props.getPreview,
    getTitle: props.getTitle,
  };

  if (!props.autoLoadTwoHopLinks && !isLoaded) {
    return (
      <button
        type="button"
        className="load-more-button"
        onClick={() => setIsLoaded(true)}
      >
        Show 2hop links
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="settings-button"
        onClick={() => {
          props.app.setting.open();
          props.app.setting.openTabById("2hop-links-plus");
        }}
      >
        Open Settings
      </button>
      {props.showForwardConnectedLinks && (
        <ConnectedLinksView
          {...linkProps}
          fileEntities={forwardConnectedLinks}
          displayedBoxCount={displayedBoxCount.forwardConnectedLinks}
          onLoadMore={() => loadMoreBoxes("forwardConnectedLinks")}
          title="Links"
          className="twohop-links-forward-links"
        />
      )}
      {props.showBackwardConnectedLinks && (
        <ConnectedLinksView
          {...linkProps}
          fileEntities={backwardConnectedLinks}
          displayedBoxCount={displayedBoxCount.backwardConnectedLinks}
          onLoadMore={() => loadMoreBoxes("backwardConnectedLinks")}
          title="Back Links"
          className="twohop-links-back-links"
        />
      )}
      {props.showTwohopLinks && (
        <TwohopLinksView
          {...linkProps}
          twoHopLinks={twoHopLinks}
          displayedSectionCount={displayedSectionCount.twoHopLinks}
          initialDisplayedEntitiesCount={initialBoxCount}
        />
      )}
      {displayedSectionCount.twoHopLinks < twoHopLinks.length && (
        <button
          ref={loadMoreRef}
          type="button"
          className="load-more-button"
          onClick={() => loadMoreSections("twoHopLinks")}
        >
          Load more
        </button>
      )}
      {props.showNewLinks && (
        <NewLinksView
          {...linkProps}
          fileEntities={newLinks}
          displayedBoxCount={displayedBoxCount.newLinks}
          onLoadMore={() => loadMoreBoxes("newLinks")}
        />
      )}
      {props.showTagsLinks && (
        <PropertiesLinksListView
          {...linkProps}
          propertiesLinksList={tagLinksList}
          displayedSectionCount={displayedSectionCount.tagLinksList}
          initialDisplayedEntitiesCount={initialBoxCount}
        />
      )}
      {displayedSectionCount.tagLinksList < tagLinksList.length && (
        <button
          ref={loadMoreRef}
          type="button"
          className="load-more-button"
          onClick={() => loadMoreSections("tagLinksList")}
        >
          Load more
        </button>
      )}
      {props.showPropertiesLinks && (
        <PropertiesLinksListView
          {...linkProps}
          propertiesLinksList={frontmatterKeyLinksList}
          displayedSectionCount={displayedSectionCount.frontmatterKeyLinksList}
          initialDisplayedEntitiesCount={initialBoxCount}
        />
      )}
      {displayedSectionCount.frontmatterKeyLinksList <
        frontmatterKeyLinksList.length && (
        <button
          ref={loadMoreRef}
          type="button"
          className="load-more-button"
          onClick={() => loadMoreSections("frontmatterKeyLinksList")}
        >
          Load more
        </button>
      )}
    </div>
  );
}
