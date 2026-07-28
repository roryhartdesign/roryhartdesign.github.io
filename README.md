# Rory Hart — Portfolio

This is the independent, reusable source for Rory's portfolio. The generated
site has no Squarespace code or network dependencies.

## Local preview

```sh
npm run build
PORT=4175 npm run serve
```

## Add or edit a project

Project metadata lives in `src/content/site.mjs`. A detailed project uses the
same structured format as `src/content/onboarding.mjs`:

- title, company, date and short summary
- responsibility chips
- sections containing headings, paragraphs, lists, images or galleries

Images belong in the portfolio's media library. The build system creates all
HTML routes and applies the shared header, typography, cards, chips, carousel,
pagination and footer automatically.

## Publish

Push this folder as the root of a public repository named
`roryhartdesign.github.io`. The included GitHub Actions workflow builds and
publishes the `dist` folder to GitHub Pages.
