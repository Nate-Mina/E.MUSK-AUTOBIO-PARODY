/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { CHAPTERS, BOOK_METADATA } from '../data/chapters';
import { generateDocxBlob } from './docxExport';

export async function generateKindlePackageBlob(): Promise<Blob> {
  const zip = new JSZip();

  // 1. Generate the Kindle-Ready DOCX Interior
  // Kindle Create natively imports .docx files to generate .kpf with 1 click
  const docxBlob = await generateDocxBlob();
  zip.file('Elon_Musk_The_End_Justifies_The_Means_Kindle_Ready.docx', docxBlob);

  // 2. Kindle Create Project Configuration: book.kcb (JSON)
  const bookKcb = {
    format_version: '1.0',
    tool_version: '1.92.0',
    book_type: 'reflowable',
    metadata: {
      title: BOOK_METADATA.title,
      author: BOOK_METADATA.author,
      author_role: BOOK_METADATA.authorRole,
      epigraph: BOOK_METADATA.epigraph,
      language: 'en',
      publisher: 'Starbase Aerospace Press',
      rights: 'All rights reserved across 3 dimensions and Mars orbit.',
      publication_year: 2026,
    },
    pagination: {
      front_matter_format: 'UPPER_ROMAN',
      front_matter_sections: ['title-page', 'table-of-contents', 'preface', 'introduction'],
      body_start_chapter: 'Chapter 1: First Principles of a Cosmic Entity',
      body_start_page: 1,
    },
    sections: CHAPTERS.map((c) => ({
      number: c.number,
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      section_type: c.sectionType,
      category: c.displayCategory,
      page_number: c.pageNumber,
      page_range: c.pageRange,
      has_illustration: Boolean(c.illustration),
      illustration_caption: c.illustration?.caption || null,
    })),
  };
  zip.file('book.kcb', JSON.stringify(bookKcb, null, 2));

  // 3. resources/ folder
  const resources = zip.folder('resources');
  if (resources) {
    // Amazon Ion format ManifestFile
    const manifestFileContent = `AmazonYJManifest. digital_content_manifest::{
  version: 1,
  storage_type: "packageArchive",
  digital_content_name: "${BOOK_METADATA.title}",
  author: "${BOOK_METADATA.author}",
  total_sections: ${CHAPTERS.length},
  front_matter_pagination: "I, II, III, IV, V",
  body_pagination_start: 1,
  illustrations_count: 14
}
`;
    resources.file('ManifestFile', manifestFileContent);

    // resources/images folder
    const imagesFolder = resources.folder('images');
    if (imagesFolder) {
      // Cover image
      if (BOOK_METADATA.coverImage) {
        try {
          const resp = await fetch(BOOK_METADATA.coverImage);
          if (resp.ok) {
            const buf = await resp.arrayBuffer();
            imagesFolder.file('cover_art.jpg', buf);
          }
        } catch (e) {
          console.warn('Could not fetch cover image for Kindle package:', e);
        }
      }

      // Chapter images
      for (const chap of CHAPTERS) {
        for (const para of chap.content) {
          if (para.startsWith('IMAGE: ')) {
            const parts = para.replace('IMAGE: ', '').split('|').map((s) => s.trim());
            const src = parts[0];
            if (src) {
              const filename = src.split('/').pop() || `chapter_${chap.number}.jpg`;
              try {
                const resp = await fetch(src);
                if (resp.ok) {
                  const buf = await resp.arrayBuffer();
                  imagesFolder.file(filename, buf);
                }
              } catch (e) {
                console.warn(`Could not fetch image ${src} for Kindle package:`, e);
              }
            }
          }
        }
      }
    }

    // resources/chapters folder with formatted HTML
    const chaptersFolder = resources.folder('chapters');
    if (chaptersFolder) {
      CHAPTERS.forEach((c) => {
        let html = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>${c.title}</title>\n  <style>\n    body { font-family: Georgia, serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #111; }\n    h1 { font-family: sans-serif; text-align: center; color: #0b1f3a; margin-top: 2rem; }\n    .subtitle { text-align: center; font-style: italic; color: #555; margin-bottom: 2rem; }\n    h2 { font-family: sans-serif; color: #0d3b66; margin-top: 1.5rem; }\n    .figure { text-align: center; margin: 2rem 0; }\n    .figure img { max-width: 100%; height: auto; border: 1px solid #ccc; }\n    .caption { font-family: monospace; font-size: 0.9em; color: #555; margin-top: 0.5rem; }\n    .math { text-align: center; font-family: monospace; background: #f4f6f8; padding: 1rem; margin: 1rem 0; border: 1px solid #ddd; font-weight: bold; }\n  </style>\n</head>\n<body>\n`;
        html += `  <h1>${c.title}</h1>\n`;
        html += `  <div class="subtitle">${c.subtitle} (Page: ${c.pageRange || c.pageNumber})</div>\n`;

        for (const p of c.content) {
          if (p.startsWith('IMAGE: ')) {
            const parts = p.replace('IMAGE: ', '').split('|').map((s) => s.trim());
            html += `  <div class="figure">\n    <img src="../images/${parts[0].split('/').pop()}" alt="${parts[1] || ''}" />\n    <div class="caption">${parts[1] || ''}</div>\n  </div>\n`;
          } else if (p.startsWith('SUBHEADER: ')) {
            html += `  <h2>${p.replace('SUBHEADER: ', '')}</h2>\n`;
          } else if (p.startsWith('- ')) {
            html += `  <p>• ${p.replace('- ', '')}</p>\n`;
          } else if (p.includes('=') && (p.includes('/') || p.includes('^') || p.includes('-'))) {
            html += `  <div class="math">${p}</div>\n`;
          } else {
            html += `  <p>${p}</p>\n`;
          }
        }
        html += `</body>\n</html>`;
        chaptersFolder.file(`${c.id}.html`, html);
      });
    }
  }

  // 4. Publishing Guide for Amazon KDP & Kindle Create
  const guideContent = `# AMAZON KINDLE PUBLISHING & KPF EXPORT GUIDE

Title: ${BOOK_METADATA.title}
Author: ${BOOK_METADATA.author} (${BOOK_METADATA.authorRole})
Epigraph: "${BOOK_METADATA.epigraph}"

---

## METHOD 1: Instant 1-Click Upload to Amazon KDP (Recommended)
Amazon Kindle Direct Publishing (KDP) officially recommends and prefers EPUB3 (.epub) files for all new Kindle eBooks.
1. Download the Kindle & E-Reader EPUB (.epub) from this app.
2. Sign in to your dashboard at https://kdp.amazon.com.
3. Create a new "Kindle eBook" and fill in your book details.
4. In the "Kindle eBook Content" tab, click "Upload eBook manuscript" and select the .epub file.
5. Amazon KDP automatically converts and optimizes the package with Enhanced Typesetting (KFX) for all Kindle Paperwhite, Oasis, Scribe, Fire, and mobile apps!

---

## METHOD 2: Using Amazon Kindle Create (For .kpf File Generation)
If you wish to produce a native Amazon .kpf file using Amazon's free Kindle Create desktop application:
1. Download and install Kindle Create from Amazon (free for PC & Mac):
   https://www.amazon.com/KindleCreate
2. Launch Kindle Create and click "New Project from File".
3. Choose "Reflowable" (recommended for novels and non-fiction biographies).
4. Select the included "Elon_Musk_The_End_Justifies_The_Means_Kindle_Ready.docx" inside this package.
5. Kindle Create will automatically detect:
   - Front matter Roman numerals (I, II, III, IV, V)
   - Chapter 1 starting at Page 1
   - All 13 neo-noir chapter plates and Chapter 5's high-contrast forensic audit diagram
   - Heading 1 chapter demarcations and subheadings
6. Preview the book using the built-in Kindle Previewer tool.
7. Click "Publish" or "Export" in the top right corner. Kindle Create will immediately output your official .kpf (Kindle Package Format) file!
8. Upload that .kpf file to Amazon KDP.

---

## METHOD 3: Using the Included Project Files
- book.kcb: Kindle Create Book project manifest with metadata and pagination mappings.
- resources/: Full source XHTML chapters, CSS stylesheet, and high-resolution JPEG illustrations.

*All rights reserved across 3 dimensions and Mars orbit.*
`;
  zip.file('KINDLE_PUBLISHING_GUIDE.md', guideContent);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/octet-stream',
  });
}
