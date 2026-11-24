# Christian & Allie's wedding site

The website at **https://wedding.caldrooten.com**. It is one page of plain HTML, hosted free on GitHub Pages from https://github.com/ccaldron/wedding-site. No build step, no framework.

Live since 2026-11-24. The striped yellow notes on the page are the unfinished items from the mockup, left visible on purpose until the real answers are in (see "Unfinished items" below).

> This repository is public. Anything saved here can be read by anyone.
> Never put RSVP answers, guest lists, passwords or keys in this folder.

## What's in here

| File | What it is |
| --- | --- |
| `index.html` | All the words on the site. This is the file you edit most. |
| `css/site.css` | Colors, fonts and layout. |
| `js/site.js` | The countdown and the RSVP form. The RSVP address is set at the top. |
| `images/` | The photo of you two and the browser-tab icon. |
| `camp-packing-checklist.pdf` | The printable packing list linked from "What to pack". |
| `rsvp-backend/Code.gs` | The small script that lives in your Google Sheet and receives RSVPs. A copy for reference. |
| `CNAME` | Tells GitHub the site's address is `wedding.caldrooten.com`. Don't delete it. |
| `.nojekyll` | Tells GitHub to serve the files as they are. Don't delete it. |

## Edit the content

1. Open `index.html` in any text editor (Notepad works; VS Code is nicer).
2. Each part of the page starts with a line like `<section id="schedule" ...>`. The ids are `welcome`, `story`, `party`, `schedule`, `location`, `lodging`, `travel`, `pack`, `faq`, `registry` and `rsvp`. Search for the words you want to change and type over them.
3. Keep the `<tags>` around the words as they are. Only change the text between them.
4. Save, preview (below), then publish (below).

Common edits:

- **Schedule.** Each line is `<li><time>5:00 PM</time><span>Dinner</span></li>`. Copy a line to add one, delete a line to remove one. When the schedule is final, delete `<span class="draft">Draft</span>` and reword the sentence before it.
- **FAQ.** Each question is one `<details>` line: the question sits in `<summary>`, the answer in `<p>`.
- **Photo.** Replace `images/christian-and-allie.jpg` with a new photo of the same name. A photo about 1200 pixels wide looks sharp without being slow.
- **Dates and countdown.** The date appears in the hero, the footer and the hero artwork in `index.html`. The countdown date is `new Date(2027, 2, 26)` in `js/site.js` (months count from 0, so 2 is March).
- **Unfinished items.** Anything wrapped in `<span class="tbd">…</span>` shows as a striped yellow note. Replace the whole span with the real words. To find what's left, search `index.html` for `class="tbd"`.

## Preview on your computer

From this folder, run:

```powershell
python -m http.server 5210 --bind 127.0.0.1
```

Then open http://localhost:5210 in a browser. Press Ctrl+C in the terminal to stop it. Check the page at phone width too (in Chrome or Edge: F12, then the phone icon).

## Publish a change

The live site updates a minute or two after you push to the `main` branch.

```powershell
git add -A
```

```powershell
git commit -m "Update schedule"
```

```powershell
git push
```

Before `git commit`, run `git status` and make sure only site files are listed. If a spreadsheet or export shows up, don't commit it.

Commits from this folder are signed with the GitHub no-reply address for `ccaldron`, so no personal email appears in the public history. Run the commands from inside `wedding-site/`; the folder above it is not part of the repository.

## RSVPs

**Status: connected (2026-11-24).** RSVPs land in the Google Sheet named "Wedding RSVPs" in Christian's Google Drive, on the tab called `RSVPs`. The one-time setup below is already done; it is kept here in case the sheet ever has to be rebuilt.

### How it works

The form on the page sends each RSVP to a small script attached to a Google Sheet in your own Google account. The script adds one row per RSVP to a tab called `RSVPs`. Nothing is stored on GitHub, and no other company sees the answers.

### Read and export the RSVPs

- Open the Google Sheet. Each RSVP is a row: time received, names, attending, number in party, T-shirt sizes, dietary restrictions, sleeping pad, help with bedding.
- To export: **File → Download → Comma-separated values (.csv)** or **Microsoft Excel (.xlsx)**.
- To let Allie (or anyone else) see it: the **Share** button in the sheet.
- To get an email for each new RSVP: **Tools → Notification settings → Edit notifications**.
- Save exports somewhere outside this folder.

### One-time setup (about five minutes)

1. Signed in to Google, open https://sheets.new and name the sheet, for example "Wedding RSVPs".
2. In the sheet: **Extensions → Apps Script**.
3. Delete whatever is in the editor, paste in everything from `rsvp-backend/Code.gs`, and save.
4. **Deploy → New deployment**. Click the gear and choose **Web app**. Set *Execute as* to **Me** and *Who has access* to **Anyone**. Click **Deploy**.
5. Google asks for permission the first time. Choose your account. On the "Google hasn't verified this app" screen click **Advanced**, then **Go to (your project name)**. It is your own script, and it asks for access to this one spreadsheet only.
6. Copy the **Web app URL**. It ends in `/exec`.
7. Paste it between the quotes on the `RSVP_ENDPOINT` line at the top of `js/site.js`, then publish.

That address is not a password. It can only add RSVPs; it cannot read the sheet.

### Test it

Send an RSVP from the live site on your phone, then check that a new row appears in the sheet. Delete test rows by deleting the row in the sheet.

### Change the script later

After editing the script in Apps Script: **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The address stays the same. (Choosing "New deployment" instead creates a new address, and `js/site.js` would need updating.)

### Spam protection

- A hidden field that people never see. Bots fill it in and are quietly dropped.
- Submissions sent less than three seconds after the page loads are dropped.
- No more than 60 RSVPs are accepted in any one hour.
- Answers that start with `=`, `+`, `-` or `@` are stored as plain text so they can't run as spreadsheet formulas.

If junk still gets through, a free Cloudflare Turnstile check can be added to the form and verified in the script.

### Close RSVPs

Set `RSVP_ENDPOINT` back to `''` in `js/site.js` and publish. To shut the receiving end as well: in Apps Script, **Deploy → Manage deployments → Archive**.

## Address, DNS and HTTPS

- The domain `caldrooten.com` is registered and managed at **Wix** (nameservers `ns2.wixdns.net`, `ns3.wixdns.net`).
- The only record this site needs is a **CNAME** for host `wedding` pointing to `ccaldron.github.io`. The records for the bare domain and `www` belong to the Wix site; leave them alone.
- In the GitHub repository: Settings → Pages shows the custom domain `wedding.caldrooten.com` and **Enforce HTTPS**. GitHub renews the certificate on its own.
- If the site ever stops loading, check that the CNAME record still exists at Wix and that the `CNAME` file is still in this folder.

## Privacy

- The page carries `<meta name="robots" content="noindex">`, which asks search engines not to list it. It is still reachable by anyone who has the address.
- Think twice before adding phone numbers, home addresses or payment handles to `index.html`. They become public the moment you push.
