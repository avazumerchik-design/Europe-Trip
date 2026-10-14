# Europe Trip Guide

A simple travel guide website: one page per city with sights, food, bars, history, culture tips, films, books and current issues.

## How the files are organized

- `index.html` - the page. Lists which city files to load.
- `style.css` - colors, fonts and spacing.
- `app.js` - builds each city page. The `SECTIONS` list at the top controls which sections appear and in what order.
- `data/` - one file per city. This is where the content lives.

## Editing a city

Open its file in `data/` (for example `data/paris.js`). Each section is a list of text in quotes, separated by commas.

- Change text between the quotes.
- Add an item by adding a new line with quotes and a comma.
- Use `"Title | description"` to show the title in bold.
- `history` is a list of paragraphs.
- Delete a whole section from a city and it disappears from the page.

If a line has an apostrophe it is fine inside double quotes. Do not put a double quote inside the text.

## Adding a city

1. Copy any file in `data/` and rename it, like `rome.js`.
2. Change the name, country and content.
3. In `index.html`, add `<script src="data/rome.js"></script>` with the others. Cities appear in the order of these lines.

## Changing sections

Edit the `SECTIONS` list in `app.js`. To add a new section, add a line like `["hotels", "Where to stay"]` and put a `hotels: [...]` list in the city files.

## Preview locally

Open `index.html` in a browser, or use the Live Server extension in VS Code.

## Put it online with GitHub Pages

Upload all files and the `data` folder to a GitHub repo, then Settings > Pages > Deploy from a branch > `main` > `/ (root)`.

## Current events

The Right now sections are general notes written from what was known when the site was made. Check recent news before you travel.
