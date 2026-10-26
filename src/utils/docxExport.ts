/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Footer, PageNumber, NumberFormat } from 'docx';
import { CHAPTERS, BOOK_METADATA } from '../data/chapters';

export async function generateDocxBlob(): Promise<Blob> {
  const frontMatterChildren: Paragraph[] = [];
  const manuscriptChildren: Paragraph[] = [];

  // Helper to determine destination section
  const getTargetArray = (sectionType: string): Paragraph[] => {
    return sectionType === 'frontmatter' ? frontMatterChildren : manuscriptChildren;
  };

  // 1. Cover Page with High-Resolution Embedded Cover Image
  try {
    const coverResp = await fetch(BOOK_METADATA.coverImage);
    if (coverResp.ok) {
      const coverBuffer = await coverResp.arrayBuffer();
      frontMatterChildren.push(
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
  frontMatterChildren.push(
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
      spacing: { after: 1200 },
      children: [
        new TextRun({
          text: `By ${BOOK_METADATA.author} (${BOOK_METADATA.authorRole})`,
          bold: true,
          size: 26, // 13pt
          color: '003366',
          font: 'Arial',
        }),
      ],
    })
  );

  // 3. Process All Sections (Front Matter, Chapters 1-13, Back Matter)
  for (const c of CHAPTERS) {
    // Skip re-rendering Section 1 as raw text since it is already formatted as the formal Title Page above
    if (c.number === 1) continue;

    const targetList = getTargetArray(c.sectionType);
    const isChapter = c.sectionType === 'chapter';
    const isToc = c.id === 'table-of-contents';
    const headingText = c.title.toUpperCase();

    // Section Header
    targetList.push(
      new Paragraph({
        pageBreakBefore: c.number !== 5, // Section 5 is the first page of the new manuscript section
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        children: [
          new TextRun({
            text: headingText,
            bold: true,
            size: 28, // 14pt
            font: 'Arial',
            color: isChapter ? '003366' : isToc ? '004466' : '006644',
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
    for (const para of c.content) {
      if (para.startsWith('IMAGE: ')) {
        const parts = para.replace('IMAGE: ', '').split('|').map((s) => s.trim());
        const imgSrc = parts[0];
        const imgCaption = parts[1] || '';
        try {
          const imgResp = await fetch(imgSrc);
          if (imgResp.ok) {
            const imgBuffer = await imgResp.arrayBuffer();
            targetList.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 120 },
                children: [
                  new ImageRun({
                    data: imgBuffer,
                    transformation: {
                      width: 540,
                      height: 330,
                    },
                    type: 'jpg',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 240 },
                children: [
                  new TextRun({
                    text: imgCaption,
                    italics: true,
                    size: 20, // 10pt
                    color: '555555',
                    font: 'Georgia',
                  }),
                ],
              })
            );
          }
        } catch (err) {
          console.warn('Could not embed chapter image in docx:', err);
        }
      } else if (para.startsWith('SUBHEADER: ')) {
        const subheaderTitle = para.replace('SUBHEADER: ', '');
        targetList.push(
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
        targetList.push(
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
          targetList.push(
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
        targetList.push(
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
        targetList.push(
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
    }
  }

  // Dual-section document:
  // Section 1: Front Matter with Roman numerals (I, II, III, IV, ...)
  // Section 2: Chapters 1-13 & Back Matter with Arabic numerals starting at Page 1!
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.UPPER_ROMAN,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Georgia',
                    size: 20,
                    color: '555555',
                  }),
                ],
              }),
            ],
          }),
        },
        children: frontMatterChildren,
      },
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Georgia',
                    size: 20,
                    color: '555555',
                  }),
                ],
              }),
            ],
          }),
        },
        children: manuscriptChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
