#!/usr/bin/env node
// Stamps partials/header.html and partials/footer.html into every top-level *.html page,
// between <!-- partial:NAME --> ... <!-- /partial:NAME --> markers, and marks the current page
// with aria-current="page". Run after editing a partial:  node scripts/sync-partials.js [page.html ...]
// (pass page names to sync only those pages; default is every page)
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const partials = ['header', 'footer'].map(name => ({
  name,
  html: fs.readFileSync(path.join(root, 'partials', name + '.html'), 'utf8').trim(),
}));

const only = process.argv.slice(2).map(f => path.basename(f));
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html') && (!only.length || only.includes(f)));
let changed = 0;
for (const file of pages) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, 'utf8');
  let html = before;
  for (const { name, html: partial } of partials) {
    const re = new RegExp(`(<!-- partial:${name} -->)[\\s\\S]*?(<!-- /partial:${name} -->)`);
    if (!re.test(html)) {
      console.warn(`${file}: missing <!-- partial:${name} --> markers`);
      continue;
    }
    // Mark links to this page (ignoring #anchors) as current.
    const marked = partial.replace(/<a ([^>]*?)href="([^"#]+)(#[^"]*)?"/g, (m, attrs, href, hash) =>
      href === file && !hash ? `<a ${attrs}href="${href}" aria-current="page"` : m);
    html = html.replace(re, (m, open, close) => `${open}\n${marked}\n${close}`);
  }
  if (html !== before) {
    fs.writeFileSync(full, html);
    changed++;
  }
}
console.log(`Synced partials into ${changed}/${pages.length} pages.`);
