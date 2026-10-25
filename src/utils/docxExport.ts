/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import { CHAPTERS, BOOK_METADATA } from '../data/chapters';

export async function generateDocxBlob(): Promise<Blob> {
  const children: Paragraph[] = [];

  // 1. Cover Page with High-Resolution Embedded Cover Image
  try {
    const coverResp = await fetch(BOOK_METADATA.coverImage);
    if (coverResp.ok) {
      const coverBuffer = await coverResp.arrayBuffer();
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 200 },
          children: [
            new ImageRun({
              data: coverBuffer,
              transformation: {
                width: 420,
                height: 630,
              },
              type: 'jpg',
            }),
          ],
        })
      );
    }
  } catch (err) {
    console.warn('Could not embed cover image in docx, proceeding with text title page:', err);
  }

  // 2. Formal Interior Title Page
  children.push(
    new Paragraph({
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { before: 600, after: 200 },
      children: [
        new TextRun({
          text: 'ELON MUSK: THE END JUSTIFIES THE MEANS',
          bold: true,
          size: 38, // 19pt
          font: 'Arial',
          color: '111111',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `"${BOOK_METADATA.epigraph}"`,
          italics: true,
          size: 24, // 12pt
          color: '444444',
          font: 'Georgia',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [
        new TextRun({
          text: `By ${BOOK_METADATA.author} (${BOOK_METADATA.authorRole})`,
          bold: true,
          size: 26, // 13pt
          color: '003366',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: BOOK_METADATA.publisher,
          size: 18,
          color: '777777',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `${BOOK_METADATA.location} · ISBN: ${BOOK_METADATA.isbn} · ${BOOK_METADATA.publicationYear}`,
          size: 16,
          color: '888888',
          font: 'Arial',
        }),
      ],
    })
  );

  // 3. Process All Sections (Front Matter, Chapters 1-13, Back Matter)
  CHAPTERS.forEach((c) => {
    // Skip re-rendering Section 1 as raw text since it is already formatted as the formal Title Page above
    if (c.number === 1) return;

    const isChapter = c.sectionType === 'chapter';
    const headingText = isChapter
      ? c.title.toUpperCase()
      : c.title.toUpperCase();

    // Section Header
    children.push(
      new Paragraph({
        pageBreakBefore: true,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        children: [
          new TextRun({
            text: headingText,
            bold: true,
            size: 28, // 14pt
            font: 'Arial',
            color: isChapter ? '003366' : '006644',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: c.subtitle,
            italics: true,
            size: 22, // 11pt
            color: '555555',
            font: 'Georgia',
          }),
        ],
      })
    );

    // Section Paragraphs
    c.content.forEach((para) => {
      if (para.startsWith('SUBHEADER: ')) {
        const subheaderTitle = para.replace('SUBHEADER: ', '');
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: subheaderTitle,
                bold: true,
                size: 24, // 12pt
                font: 'Arial',
                color: '006699',
              }),
            ],
          })
        );
      } else if (para.startsWith('- ')) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: para.replace('- ', ''),
                size: 22,
                font: 'Arial',
              }),
            ],
          })
        );
      } else if (para.startsWith('|') && para.includes('|')) {
        if (!para.includes('---')) {
          const cells = para
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean);
          children.push(
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: cells.join('   |   '),
                  font: 'Courier New',
                  size: 18,
                  bold: para.toLowerCase().includes('category') || para.toLowerCase().includes('entity'),
                }),
              ],
            })
          );
        }
      } else if (para.includes('=') && (para.includes('/') || para.includes('^') || para.includes('-'))) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 180 },
            children: [
              new TextRun({
                text: para,
                bold: true,
                font: 'Courier New',
                size: 20,
                color: '004488',
              }),
            ],
          })
        );
      } else {
        children.push(
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: para,
                size: 22, // 11pt
                font: 'Georgia',
              }),
            ],
          })
        );
      }
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
