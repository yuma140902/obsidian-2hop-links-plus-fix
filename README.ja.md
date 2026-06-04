# Obsidian 2Hop Links Plus Fix

このプラグインは [tokuhirom/obsidian-2hop-links-plugin](https://github.com/tokuhirom/obsidian-2hop-links-plugin) のフォークである [L7Cy/obsidian-2hop-links-plus](https://github.com/L7Cy/obsidian-2hop-links-plus) のフォークです。

以下の変更を加えてあります。

- webp, gif, avif の表示に対応
- `![](<path to image.png>)` のように `<>` で囲まれた形式の画像リンクに対応
- `![](path%20to%20image.png)` のように URL エンコードされた形式の画像リンクに対応
- 中ボタンクリックしたときにマウスカーソルのアイコンが元に戻らなくなる問題を修正
- ノートに `image` プロパティがあればそれを優先するように変更
- バンドル時にコードを minify する

[BRAT](https://github.com/TfTHacker/obsidian42-brat) を使用してインストールしてください。

以下はフォーク元である L7Cy/obsidian-2hop-links-plus の README です。

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
