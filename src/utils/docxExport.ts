/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { CHAPTERS } from '../data/chapters';

export async function generateDocxBlob(): Promise<Blob> {
  const children: Paragraph[] = [];

  // Book Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200, before: 400 },
      children: [
        new TextRun({
          text: 'ELON MUSK: THE END JUSTIFIES THE MEANS',
          bold: true,
          size: 36, // 18pt
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: 'A Satirical Autobiography Across Three Dimensions and Mars Orbit',
          italics: true,
          size: 24, // 12pt
          color: '555555',
          font: 'Arial',
        }),
      ],
    })
  );

  // Iterate through all 13 chapters
  CHAPTERS.forEach((c, index) => {
    // Chapter Title
    children.push(
      new Paragraph({
        pageBreakBefore: index > 0,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        children: [
          new TextRun({
            text: `CHAPTER ${c.number}: ${c.title.toUpperCase()}`,
            bold: true,
            size: 28, // 14pt
            font: 'Arial',
            color: '003366',
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
            color: '666666',
            font: 'Arial',
          }),
        ],
      })
    );

    // Chapter Content
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
        // Table row or divider
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
