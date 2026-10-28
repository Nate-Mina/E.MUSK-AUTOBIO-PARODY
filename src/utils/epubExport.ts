/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { CHAPTERS, BOOK_METADATA } from '../data/chapters';

// Helper to escape HTML entities for valid XHTML
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateEpubBlob(): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype MUST be the first file and uncompressed (STORE)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.folder('META-INF')?.file(
    'container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const oebps = zip.folder('OEBPS');
  if (!oebps) throw new Error('Failed to create OEBPS folder in EPUB archive');

  // 3. OEBPS/styles.css
  const stylesCss = `/* EPUB 3 Typography for Kindle and Modern E-Readers */
@charset "utf-8";

body {
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.6;
  margin: 4% 5%;
  color: #121212;
  background-color: transparent;
}

h1.book-title {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 2em;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
  margin-top: 15%;
  margin-bottom: 0.3em;
  color: #051622;
  letter-spacing: 0.05em;
}

p.epigraph {
  font-style: italic;
  font-size: 1.15em;
  text-align: center;
  color: #444444;
  margin-bottom: 2em;
}

p.author {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.1em;
  font-weight: 700;
  text-align: center;
  color: #0b3c5d;
  margin-bottom: 3em;
}

h1.chapter-title {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.6em;
  font-weight: 700;
  text-align: center;
  margin-top: 2em;
  margin-bottom: 0.4em;
  color: #0b1f3a;
  page-break-before: always;
}

p.chapter-subtitle {
  font-style: italic;
  font-size: 1em;
  text-align: center;
  color: #555555;
  margin-bottom: 2em;
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 1em;
}

h2.section-header {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.25em;
  font-weight: 700;
  color: #0d3b66;
  margin-top: 1.8em;
  margin-bottom: 0.6em;
  border-left: 3px solid #0d3b66;
  padding-left: 0.5em;
}

p {
  margin-bottom: 1em;
  text-align: justify;
  text-indent: 1.5em;
}

p.noindent {
  text-indent: 0;
}

ul.bullet-list {
  margin-top: 0.5em;
  margin-bottom: 1em;
  padding-left: 1.8em;
}

ul.bullet-list li {
  margin-bottom: 0.5em;
}

.figure {
  text-align: center;
  margin: 2em auto;
  page-break-inside: avoid;
  max-width: 95%;
}

.figure img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  border: 1px solid #c8d1d9;
}

.caption {
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
  color: #555555;
  margin-top: 0.6em;
  font-style: italic;
  text-align: center;
}

.math-block {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  margin: 1.5em 0;
  padding: 0.8em;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  font-size: 0.95em;
  color: #032f62;
}

/* Table of Contents Styling */
.toc-container {
  max-width: 600px;
  margin: 0 auto;
}

.toc-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dotted #ccc;
  padding: 0.4em 0;
  margin: 0.3em 0;
}

.toc-title {
  font-weight: 500;
  text-decoration: none;
  color: #0d3b66;
}

.toc-page {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #666666;
}
`;
  oebps.file('styles.css', stylesCss);

  // 4. Download and embed image assets in OEBPS/images/
  const imagesFolder = oebps.folder('images');
  if (!imagesFolder) throw new Error('Failed to create images folder in EPUB');

  // Mapping from original URL to internal EPUB filename
  const imageMap = new Map<string, string>();
  const imageManifestItems: { id: string; href: string; mediaType: string }[] = [];

  // Always collect cover image
  if (BOOK_METADATA.coverImage) {
    try {
      const resp = await fetch(BOOK_METADATA.coverImage);
      if (resp.ok) {
        const buf = await resp.arrayBuffer();
        imagesFolder.file('cover.jpg', buf);
        imageMap.set(BOOK_METADATA.coverImage, 'images/cover.jpg');
        imageManifestItems.push({
          id: 'cover-image',
          href: 'images/cover.jpg',
          mediaType: 'image/jpeg',
        });
      }
    } catch (err) {
      console.warn('Could not fetch cover image for EPUB:', err);
    }
  }

  // Collect all chapter images
  for (const chap of CHAPTERS) {
    for (const para of chap.content) {
      if (para.startsWith('IMAGE: ')) {
        const parts = para.replace('IMAGE: ', '').split('|').map((s) => s.trim());
        const src = parts[0];
        if (src && !imageMap.has(src)) {
          const filename = `img_${imageMap.size + 1}.jpg`;
          try {
            const resp = await fetch(src);
            if (resp.ok) {
              const buf = await resp.arrayBuffer();
              imagesFolder.file(filename, buf);
              imageMap.set(src, `images/${filename}`);
              imageManifestItems.push({
                id: `img-${imageMap.size}`,
                href: `images/${filename}`,
                mediaType: 'image/jpeg',
              });
            }
          } catch (err) {
            console.warn(`Could not fetch image ${src} for EPUB:`, err);
          }
        }
      }
    }
  }

  // 5. Generate Individual Section XHTML Documents
  const spineItems: { id: string; href: string; title: string; isFront: boolean; pageRange: string }[] = [];

  // Cover Page (XHTML)
  if (imageMap.has(BOOK_METADATA.coverImage)) {
    const coverXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
  <head>
    <title>Cover</title>
    <link rel="stylesheet" type="text/css" href="styles.css" />
    <style type="text/css">
      @page { margin: 0; padding: 0; }
      body { margin: 0; padding: 0; text-align: center; }
      img.cover-art { max-width: 100%; height: 100vh; object-fit: contain; }
    </style>
  </head>
  <body>
    <div style="text-align: center;">
      <img src="images/cover.jpg" alt="${escapeXml(BOOK_METADATA.title)}" class="cover-art" />
    </div>
  </body>
</html>`;
    oebps.file('cover.xhtml', coverXhtml);
    spineItems.push({
      id: 'cover',
      href: 'cover.xhtml',
      title: 'Cover Page',
      isFront: true,
      pageRange: 'p. I',
    });
  }

  // Process all chapters
  CHAPTERS.forEach((chap, idx) => {
    // Skip Section 1 if cover art is already the cover page, but render title page
    const fileId = `section_${String(idx + 1).padStart(2, '0')}`;
    const filename = `${fileId}.xhtml`;

    let bodyHtml = '';

    if (chap.number === 1) {
      // Title Page
      bodyHtml += `<h1 class="book-title">${escapeXml(BOOK_METADATA.title)}</h1>\n`;
      bodyHtml += `<p class="epigraph">"${escapeXml(BOOK_METADATA.epigraph)}"</p>\n`;
      bodyHtml += `<p class="author">By ${escapeXml(BOOK_METADATA.author)} (${escapeXml(BOOK_METADATA.authorRole)})</p>\n`;
      bodyHtml += `<hr style="margin: 2em 0; border: none; border-top: 1px solid #ccc;" />\n`;
    } else {
      bodyHtml += `<h1 class="chapter-title">${escapeXml(chap.title)}</h1>\n`;
      bodyHtml += `<p class="chapter-subtitle">${escapeXml(chap.subtitle)}</p>\n`;
    }

    let inBulletList = false;

    for (const para of chap.content) {
      if (para.startsWith('IMAGE: ')) {
        if (inBulletList) {
          bodyHtml += `</ul>\n`;
          inBulletList = false;
        }
        const parts = para.replace('IMAGE: ', '').split('|').map((s) => s.trim());
        const rawSrc = parts[0];
        const caption = parts[1] || '';
        const epubSrc = imageMap.get(rawSrc) || rawSrc;
        bodyHtml += `<div class="figure">\n`;
        bodyHtml += `  <img src="${escapeXml(epubSrc)}" alt="${escapeXml(caption)}" />\n`;
        if (caption) {
          bodyHtml += `  <div class="caption">${escapeXml(caption)}</div>\n`;
        }
        bodyHtml += `</div>\n`;
      } else if (para.startsWith('SUBHEADER: ')) {
        if (inBulletList) {
          bodyHtml += `</ul>\n`;
          inBulletList = false;
        }
        const title = para.replace('SUBHEADER: ', '');
        bodyHtml += `<h2 class="section-header">${escapeXml(title)}</h2>\n`;
      } else if (para.startsWith('- ')) {
        if (!inBulletList) {
          bodyHtml += `<ul class="bullet-list">\n`;
          inBulletList = true;
        }
        bodyHtml += `  <li>${escapeXml(para.replace('- ', ''))}</li>\n`;
      } else if (para.startsWith('  ')) {
        // Indented subtext
        if (inBulletList) {
          bodyHtml += `</ul>\n`;
          inBulletList = false;
        }
        bodyHtml += `<p style="margin-left: 2em; font-size: 0.9em; font-style: italic; color: #555;">${escapeXml(para.trim())}</p>\n`;
      } else if (para.includes('=') && (para.includes('/') || para.includes('^') || para.includes('-'))) {
        if (inBulletList) {
          bodyHtml += `</ul>\n`;
          inBulletList = false;
        }
        bodyHtml += `<div class="math-block"><code>${escapeXml(para)}</code></div>\n`;
      } else {
        if (inBulletList) {
          bodyHtml += `</ul>\n`;
          inBulletList = false;
        }
        bodyHtml += `<p>${escapeXml(para)}</p>\n`;
      }
    }

    if (inBulletList) {
      bodyHtml += `</ul>\n`;
    }

    const docXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
  <head>
    <title>${escapeXml(chap.title)}</title>
    <link rel="stylesheet" type="text/css" href="styles.css" />
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`;

    oebps.file(filename, docXhtml);
    spineItems.push({
      id: fileId,
      href: filename,
      title: chap.title,
      isFront: chap.sectionType === 'frontmatter',
      pageRange: chap.pageRange || `p. ${chap.pageNumber}`,
    });
  });

  // 6. OEBPS/nav.xhtml (EPUB 3 Navigation Document with Roman Numerals & Chapter 1 Page 1)
  const navItemsHtml = spineItems
    .map(
      (item) =>
        `        <li><a href="${item.href}">${escapeXml(item.title)}</a> <span class="page-badge">(${escapeXml(item.pageRange)})</span></li>`
    )
    .join('\n');

  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
  <head>
    <title>Table of Contents</title>
    <link rel="stylesheet" type="text/css" href="styles.css" />
  </head>
  <body>
    <nav epub:type="toc" id="toc" class="toc-container">
      <h1 class="chapter-title">Table of Contents</h1>
      <p class="chapter-subtitle">Unabridged Manuscript · Front Matter in Roman Numerals (I–VI) · Chapter 1 Starts at Page 1</p>
      <ol class="toc-list" style="line-height: 1.8;">
${navItemsHtml}
      </ol>
    </nav>
  </body>
</html>`;
  oebps.file('nav.xhtml', navXhtml);

  // 7. OEBPS/toc.ncx (EPUB 2 NCX for Kindle Legacy Compatibility)
  const ncxNavPoints = spineItems
    .map(
      (item, idx) => `    <navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}">
      <navLabel><text>${escapeXml(item.title)} (${escapeXml(item.pageRange)})</text></navLabel>
      <content src="${item.href}"/>
    </navPoint>`
    )
    .join('\n');

  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:elon-musk-the-end-justifies-the-means-2026"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(BOOK_METADATA.title)}</text></docTitle>
  <docAuthor><text>${escapeXml(BOOK_METADATA.author)}</text></docAuthor>
  <navMap>
${ncxNavPoints}
  </navMap>
</ncx>`;
  oebps.file('toc.ncx', tocNcx);

  // 8. OEBPS/content.opf (Master Manifest & Spine)
  const manifestItemsXml = [
    `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `    <item id="styles" href="styles.css" media-type="text/css"/>`,
    ...spineItems.map((item) => `    <item id="${item.id}" href="${item.href}" media-type="application/xhtml+xml"/>`),
    ...imageManifestItems.map(
      (img) =>
        `    <item id="${img.id}" href="${img.href}" media-type="${img.mediaType}"${
          img.id === 'cover-image' ? ' properties="cover-image"' : ''
        }/>`
    ),
  ].join('\n');

  const spineItemsXml = spineItems.map((item) => `    <itemref idref="${item.id}"/>`).join('\n');

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">urn:uuid:elon-musk-the-end-justifies-the-means-2026</dc:identifier>
    <dc:title>${escapeXml(BOOK_METADATA.title)}</dc:title>
    <dc:creator>${escapeXml(BOOK_METADATA.author)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:publisher>Starbase Aerospace Press</dc:publisher>
    <dc:rights>All rights reserved across 3 dimensions and Mars orbit.</dc:rights>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
${manifestItemsXml}
  </manifest>
  <spine toc="ncx">
${spineItemsXml}
  </spine>
  <guide>
    <reference type="cover" title="Cover" href="${spineItems[0]?.href || 'section_01.xhtml'}"/>
    <reference type="toc" title="Table of Contents" href="nav.xhtml"/>
    <reference type="text" title="Beginning" href="section_05.xhtml"/>
  </guide>
</package>`;

  oebps.file('content.opf', contentOpf);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
  });
}
