# Shahar Lando - Data & ML Portfolio

Static website prepared for https://shoohi.github.io/my-web-site/.

## Publish through the GitHub website

1. Extract this ZIP.
2. Open https://github.com/shoohi/my-web-site.
3. Select Add file > Upload files.
4. Upload the files from this folder directly to the repository root. Do not upload the ZIP or wrap the files in another folder. Include the CV PDF.
5. Commit the upload to main, or merge the upload pull request into main.
6. Open Settings > Pages.
7. Choose Deploy from a branch, main, and / (root), then Save.
8. Wait for the Pages deployment to finish. Open the URL displayed in Settings > Pages.

If the repository already contains a website or deployment workflow, review conflicting files before replacing them.

## Files

- index.html, style.css, app.js, fractal-camera.js: interactive portfolio.
- profile.html, profile.css: readable profile without JavaScript.
- shahar-lando-cv.pdf: CV.
- sitemap.xml: URLs for the GitHub Pages copy.
- robots.txt: permissive crawler rules. GitHub project sites cannot control the domain-root robots.txt.
- .nojekyll: disables Jekyll processing (optional for these plain static files).

All local links are relative to support the /my-web-site/ path. Canonical URLs and structured data point to the GitHub Pages address. The earlier ChatGPT-hosted website is not modified by this export.

## Editing

Edit the HTML/CSS/JavaScript files and commit updates to main. GitHub Pages publishes the changes automatically. When changing profile/project/contact text in app.js, update the matching text in profile.html and its structured data as well.

Local preview (optional): run `python -m http.server 8000` in this folder and open http://localhost:8000.
