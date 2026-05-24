# Obsidian 2Hop Links Plus Fix

[日本語](./README.ja.md)

This plugin is a fork of [L7Cy/obsidian-2hop-links-plus](https://github.com/L7Cy/obsidian-2hop-links-plus), which is a fork of [tokuhirom/obsidian-2hop-links-plugin](https://github.com/tokuhirom/obsidian-2hop-links-plugin).

The following changes have been made:

- Added support for displaying webp, gif, and avif images
- Added support for image links enclosed in `<>`, such as `![](<path to image.png>)`
- Added support for URL-encoded image links, such as `![](path%20to%20image.png)`
- Fixed an issue where the mouse cursor icon would not return to its original state after middle-clicking
- Changed the plugin to prioritize the `image` property when it exists in a note

Install this plugin using [BRAT](https://github.com/TfTHacker/obsidian42-brat).

The following is the README from the upstream fork, L7Cy/obsidian-2hop-links-plus.

----------

# Obsidian 2Hop Links Plus

2Hop Links Plus is an [Obsidian](https://obsidian.md/) plugin that displays related links up to 2 hops away in a card format. This makes it easy to browse the connections between notes. Each card contains a preview of the corresponding note.

[![Image from Gyazo](https://i.gyazo.com/bf49c9e6314b4141215fd6f627e80da1.png)](https://gyazo.com/bf49c9e6314b4141215fd6f627e80da1)
[![Image from Gyazo](https://i.gyazo.com/4947e25e5963b6d22b748ed3204b57b2.png)](https://gyazo.com/4947e25e5963b6d22b748ed3204b57b2)

> **Note**
> This plugin is a fork of [tokuhirom/obsidian-2hop-links-plugin](https://github.com/tokuhirom/obsidian-2hop-links-plugin) and extends its functionality.
>
> The main additional features are as follows:
>
> - Automatic adjustment of box width
> - Improved preview content
> - Support for external link images
> - Setting of exclusion paths
> - Context menu (e.g., open in new tab)
> - Sort of links
> - Display in a separate pane
