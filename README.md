# The Finvocates — site source

## 1. Push this to GitHub

1. Create a new repo on GitHub (public), e.g. `finvocates-site`.
2. Upload every file in this folder to it, keeping the same structure
   (`index.html`, `about.html`, `consultations.html`, `articles.html`,
   `style.css`, `script.js`, `assets/`, `articles/`).
3. Repo → **Settings → Pages** → Source: deploy from your main branch, root folder.

## 2. Connect thefinvocates.com

1. In the same **Settings → Pages** screen, enter `thefinvocates.com` under
   "Custom domain" and save — this creates a `CNAME` file in your repo automatically.
2. In your Zoho DNS panel, add:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `<your-github-username>.github.io`
3. Back on GitHub Pages, tick **Enforce HTTPS** once it's available (can take
   up to a few hours after DNS propagates).

## 3. Turn on the live article/PDF feed

Open `script.js` and fill in the two constants at the top:

```js
const GITHUB_USER = "your-github-username";
const GITHUB_REPO  = "finvocates-site";
```

That's it. From then on, to publish something:

- Drop a `.pdf`, `.md`, or `.html` file into the `/articles` folder, named
  however you like — e.g. `RBI-Master-Direction-KYC-2026.pdf`.
- `git push` (or upload via GitHub's web UI).
- Refresh the site — it appears automatically on the homepage, the Articles
  page, and the Articles hover-menu. No code edit needed.

The filename becomes the display title (hyphens/underscores become spaces).
Delete `articles/README.md` once you've pushed your first real file.

## 4. Updating the Consultations page

Consultations are hand-written in `consultations.html` rather than pulled
live, since each one needs a short description of what was filed and with
whom. Add a new `<div class="card">` block following the existing pattern
when you file something new, and update the mega-menu preview list in each
page's `<nav>` to match.

## 5. Your photo

Already placed at `assets/chakradhar-kale.jpg` and wired into `about.html`.
Swap the file (keep the same name) any time you want to update it.
