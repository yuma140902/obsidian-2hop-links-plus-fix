import {
  MarkdownView,
  Plugin,
  parseFrontMatterTags,
  type TFile,
  type WorkspaceLeaf,
} from "obsidian";
import { getTitle } from "./getTitle";
import { Links } from "./links";
import type { FileEntity } from "./model/FileEntity";
import type { PropertiesLinks } from "./model/PropertiesLinks";
import type { TwohopLink } from "./model/TwohopLink";
import { readPreview } from "./preview";
import { loadSettings } from "./settings/index";
import {
  type TwohopPluginSettings,
  TwohopSettingTab,
} from "./settings/TwohopSettingTab";
import { renderReactRoot, unmountReactRoot } from "./ui/reactRoot";
import { SeparatePaneView } from "./ui/SeparatePaneView";
import TwohopLinksRootView from "./ui/TwohopLinksRootView";
import type { FileContentLoader } from "./ui/types";
import { removeBlockReference } from "./utils";

const CONTAINER_CLASS = "twohop-links-container";
export const HOVER_LINK_ID = "2hop-links";

export default class TwohopLinksPlugin extends Plugin {
  settings: TwohopPluginSettings;
  showLinksInMarkdown: boolean;
  links: Links;

  private previousLinks: string[] = [];
  private previousTags: string[] = [];
  private renderRevision = 0;

  private readonly getPreview: FileContentLoader = (fileEntity, signal) =>
    readPreview(this.app, fileEntity, signal);

  private readonly getFileTitle: FileContentLoader = (fileEntity, signal) =>
    getTitle(this.app, this.settings, fileEntity, signal);

  async onload(): Promise<void> {
    console.debug("------ loading obsidian-twohop-links plugin");

    this.settings = await loadSettings(this);
    this.showLinksInMarkdown = true;
    this.links = new Links(this.app, this.settings);

    this.initPlugin();
  }

  async initPlugin() {
    this.addSettingTab(new TwohopSettingTab(this.app, this));
    this.registerView(
      "TwoHopLinksView",
      (leaf: WorkspaceLeaf) => new SeparatePaneView(leaf, this, this.links),
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", async (file: TFile) => {
        if (file === this.app.workspace.getActiveFile()) {
          await this.renderTwohopLinks(false);
        }
      }),
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", this.refreshTwohopLinks),
    );
    this.app.workspace.trigger("parse-style-settings");

    await this.renderTwohopLinks(true);
  }

  onunload(): void {
    this.disableLinksInMarkdown();
    console.log("unloading plugin");
  }

  private readonly refreshTwohopLinks = async (): Promise<void> => {
    if (this.showLinksInMarkdown) {
      await this.renderTwohopLinks(true);
    }
  };

  private readonly openFile = async (fileEntity: FileEntity): Promise<void> => {
    const linkText = removeBlockReference(fileEntity.linkText);

    console.debug(
      `Open file: linkText='${linkText}', sourcePath='${fileEntity.sourcePath}'`,
    );
    const file = this.app.metadataCache.getFirstLinkpathDest(
      linkText,
      fileEntity.sourcePath,
    );
    if (file == null) {
      if (!confirm(`Create new file: ${linkText}?`)) {
        console.log("Canceled!!");
        return;
      }
    }
    return this.app.workspace.openLinkText(
      fileEntity.linkText,
      fileEntity.sourcePath,
    );
  };

  async updateTwoHopLinksView() {
    if (this.isTwoHopLinksViewOpen()) {
      this.app.workspace.detachLeavesOfType("TwoHopLinksView");
    }
    if (this.settings.showTwoHopLinksInSeparatePane) {
      this.openTwoHopLinksView();
      this.disableLinksInMarkdown();
      this.removePaddingBottom();
    } else {
      this.enableLinksInMarkdown();
    }
  }

  isTwoHopLinksViewOpen(): boolean {
    return this.app.workspace.getLeavesOfType("TwoHopLinksView").length > 0;
  }

  async openTwoHopLinksView() {
    const leaf = this.settings.panePositionIsRight
      ? this.app.workspace.getRightLeaf(false)
      : this.app.workspace.getLeftLeaf(false);
    leaf.setViewState({ type: "TwoHopLinksView" });
    this.app.workspace.revealLeaf(leaf);
  }

  private getContainerElements(markdownView: MarkdownView): Element[] {
    const elements = markdownView.containerEl.querySelectorAll(
      ".markdown-source-view .CodeMirror-lines, .markdown-preview-view, .markdown-source-view .cm-sizer",
    );

    const containers: Element[] = [];
    for (let i = 0; i < elements.length; i++) {
      const el = elements.item(i);
      const container =
        el.querySelector(`.${CONTAINER_CLASS}`) ||
        el.createDiv({ cls: CONTAINER_CLASS });
      containers.push(container);
    }

    return containers;
  }

  private getActiveFileLinks(file: TFile | null): string[] {
    if (!file) {
      return [];
    }

    const cache = this.app.metadataCache.getFileCache(file);
    return cache?.links?.map((link) => link.link) ?? [];
  }

  private getActiveFileTags(file: TFile | null): string[] {
    if (!file) {
      return [];
    }

    const cache = this.app.metadataCache.getFileCache(file);

    let tags = cache?.tags?.map((tag) => tag.tag) ?? [];

    if (cache?.frontmatter?.tags) {
      const frontMatterTags = parseFrontMatterTags(cache.frontmatter);
      if (frontMatterTags) {
        tags = tags.concat(frontMatterTags);
      }
    }

    return tags;
  }

  async renderTwohopLinks(isForceUpdate: boolean): Promise<void> {
    if (this.settings.showTwoHopLinksInSeparatePane) {
      return;
    }
    this.addPaddingBottom();
    const markdownView: MarkdownView =
      this.app.workspace.getActiveViewOfType(MarkdownView);
    const activeFile = markdownView?.file;
    if (!activeFile) {
      return;
    }

    const currentLinks = this.getActiveFileLinks(activeFile);
    const currentTags = this.getActiveFileTags(activeFile);

    if (
      isForceUpdate ||
      this.previousLinks.sort().join(",") !== currentLinks.sort().join(",") ||
      this.previousTags.sort().join(",") !== currentTags.sort().join(",")
    ) {
      const {
        forwardLinks,
        newLinks,
        backwardLinks,
        twoHopLinks,
        tagLinksList,
        frontmatterKeyLinksList,
      } = await this.links.gatherTwoHopLinks(activeFile);

      for (const container of this.getContainerElements(markdownView)) {
        await this.injectTwohopLinks(
          forwardLinks,
          newLinks,
          backwardLinks,
          twoHopLinks,
          tagLinksList,
          frontmatterKeyLinksList,
          container,
        );
      }

      this.previousLinks = currentLinks;
      this.previousTags = currentTags;
    }
  }

  async injectTwohopLinks(
    forwardConnectedLinks: FileEntity[],
    newLinks: FileEntity[],
    backwardConnectedLinks: FileEntity[],
    twoHopLinks: TwohopLink[],
    tagLinksList: PropertiesLinks[],
    frontmatterKeyLinksList: PropertiesLinks[],
    container: Element,
  ) {
    const showForwardConnectedLinks = this.settings.showForwardConnectedLinks;
    const showBackwardConnectedLinks = this.settings.showBackwardConnectedLinks;
    const showTwohopLinks = this.settings.showTwohopLinks;
    const showNewLinks = this.settings.showNewLinks;
    const showTagsLinks = this.settings.showTagsLinks;
    const showPropertiesLinks = this.settings.showPropertiesLinks;
    renderReactRoot(
      container,
      <TwohopLinksRootView
        key={this.renderRevision++}
        forwardConnectedLinks={forwardConnectedLinks}
        newLinks={newLinks}
        backwardConnectedLinks={backwardConnectedLinks}
        twoHopLinks={twoHopLinks}
        tagLinksList={tagLinksList}
        frontmatterKeyLinksList={frontmatterKeyLinksList}
        onClick={this.openFile}
        getPreview={this.getPreview}
        getTitle={this.getFileTitle}
        app={this.app}
        showForwardConnectedLinks={showForwardConnectedLinks}
        showBackwardConnectedLinks={showBackwardConnectedLinks}
        showTwohopLinks={showTwohopLinks}
        showNewLinks={showNewLinks}
        showTagsLinks={showTagsLinks}
        showPropertiesLinks={showPropertiesLinks}
        autoLoadTwoHopLinks={this.settings.autoLoadTwoHopLinks}
        initialBoxCount={this.settings.initialBoxCount}
        initialSectionCount={this.settings.initialSectionCount}
      />,
    );
  }

  enableLinksInMarkdown(): void {
    this.showLinksInMarkdown = true;
    this.renderTwohopLinks(true).then(() =>
      console.debug("Rendered two hop links"),
    );
  }

  disableLinksInMarkdown(): void {
    this.showLinksInMarkdown = false;
    this.removeTwohopLinks();
    this.app.workspace.unregisterHoverLinkSource(HOVER_LINK_ID);
  }

  removeTwohopLinks(): void {
    const markdownView: MarkdownView =
      this.app.workspace.getActiveViewOfType(MarkdownView);

    if (markdownView !== null) {
      const containers = markdownView.containerEl.querySelectorAll(
        `.${CONTAINER_CLASS}`,
      );
      for (const container of containers) {
        unmountReactRoot(container);
        container.remove();
      }
    }
  }

  addPaddingBottom(): void {
    if (!document.getElementById("twohop-custom-padding")) {
      const styleEl = document.createElement("style");
      styleEl.id = "twohop-custom-padding";
      styleEl.innerText = `
      .markdown-preview-section,
      .cm-content {
        padding-bottom: 20px !important;
      }
    `;
      document.head.appendChild(styleEl);
    }
  }

  removePaddingBottom(): void {
    const existingStyleEl = document.getElementById("twohop-custom-padding");
    if (existingStyleEl) {
      existingStyleEl.parentNode.removeChild(existingStyleEl);
    }
  }
}
