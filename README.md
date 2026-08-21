<div align="center">

<img src="icon.svg" alt="Momoirobara flower logo" width="110">

# Momoirobara

### ♡ a tiny little music room for your songs ♡

Cute. Soft. A little dreamy.

A kawaii-inspired local music player made for turning your music library into its own little idol stage.

[Open Momoirobara](https://mrcaddlr.github.io/momoirobaira/)

</div>

---

## ♡ what is Momoirobara?

Momoirobara is a lightweight web music player built around one simple idea: **your music should feel like your own little room.**

It runs as a web app through GitHub Pages and keeps your local library in your browser, so your songs can stay remembered between launches on the same browser/device.

## ✿ features

| feature | what it does |
| --- | --- |
| ♪ local library | Import your own music files and folders |
| ♡ remembered music | Your imported library is persisted locally with IndexedDB |
| ✿ playlists | Organize your songs into playlists and favorites |
| ◇ metadata | Reads music metadata and embedded artwork |
| ♫ lyrics | Lyrics support for your listening sessions |
| ☆ Last.fm | Last.fm integration |
| ⟡ themes | Customize the look of your music room |
| ❀ GitHub Pages | Runs directly from the web |

## ♡ your little music room

Momoirobara is designed to feel more like a cute desktop music room than a boring media player. Soft colors, little decorations, animated details, themes, lyrics, and your own library all come together around the music.

## ✿ launch it like an app

Want it to behave more like a desktop app?

### Linux — Flatpak Chrome

The repository includes **`launch-momoirobara`**, a shell launcher that opens Momoirobara using Flatpak Chrome's `--app` mode, so you get the app window without the normal browser tabs and address bar.

Make it executable once:

```sh
chmod +x launch-momoirobara
```

Then run it:

```sh
./launch-momoirobara
```

### Windows

Run **`Momoirobara.bat`**. It opens the Pages site using Chrome's app mode, with Microsoft Edge as a fallback.

## ♡ persistence

Imported music is stored locally in the browser using **IndexedDB**.

That means your library can survive closing and reopening Momoirobara, but browser-local data does **not** automatically sync between different devices or browsers.

## ✿ development

`main` is the active development branch.

**`backup#001` is a protected known-good backup. Do not modify it unless explicitly requested.**

All normal changes belong on `main`.

## ♡ project files

```text
Momoirobara/
├── index.html             # the music player
├── icon.svg               # Momoirobara flower logo
├── launch-momoirobara     # Linux / Flatpak Chrome launcher
├── Momoirobara.bat        # Windows launcher
└── README.md              # you are here
```

---

<div align="center">

**momoirobara**

*your songs, your little room, your stage.*

♡ ✿ ♡

</div>
