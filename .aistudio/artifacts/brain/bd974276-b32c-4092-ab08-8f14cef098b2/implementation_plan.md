# EPUB3 & Kindle Create Companion Package (.kpf) Export Implementation Plan

A comprehensive architectural plan to introduce production-grade e-book export capabilities to "Elon Musk: The End Justifies the Means", enabling one-click download of both an **industry-standard EPUB3 (`.epub`)** directly accepted by Amazon KDP, and a **Kindle Create Companion Package (`.kpf` / `.zip`)** bundling Kindle project files (`book.kcb`), Kindle-ready manuscript, high-resolution neo-noir illustration plates, and interactive Table of Contents.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following specifications were confirmed by the user in Phase 1 clarification:
> - **Export Formats**: Deliver **both** a compliant EPUB3 (`.epub`) file and a **Kindle Create companion package (`.kpf` / `.zip`)**.
> - **Asset Bundling**: Include **full illustrations** (all 13 high-contrast neo-noir chapter plates + Chapter 5 forensic audit ledger JPG + official cover art), **interactive Table of Contents**, and **Roman-numeral front matter** (`I`–`VI`) with Chapter 1 starting at Page 1.
> - **Workflow Synergy**: The `.epub` provides immediate zero-software publishing directly to Amazon KDP (Kindle Direct Publishing), Apple Books, and Kobo, while the Kindle Create package provides pre-configured `book.kcb` manifests and Kindle-ready source files for authors using Amazon's desktop Kindle Create tool.

---

## 1. Overview & Core Deliverables

1. **Client-Side EPUB 3.0 Engine (`src/utils/epubExport.ts`)**:
   - Packages an official, valid EPUB3 container:
     - `mimetype`: Uncompressed `application/epub+zip` placed at offset 0 (strict IDPF/W3C requirement).
     - `META-INF/container.xml`: Directing readers to the package root.
     - `OEBPS/content.opf`: Metadata, complete item manifest, and spine reading order.
     - `OEBPS/nav.xhtml`: EPUB3 Landmark navigation with dual-tier pagination (Roman numerals for front matter, Decimal starting at Page 1 for Chapter 1).
     - `OEBPS/toc.ncx`: EPUB2 legacy navigation for older Kindle E-ink devices.
     - `OEBPS/styles.css`: Kindle-tuned typography, responsive image wrappers, drop-caps, and dark/light mode compatibility.
     - Embedded image assets fetched as binary buffers: Book cover art, all 13 chapter plates, and Chapter 5 forensic ledger diagram.
2. **Kindle Create Companion Package Engine (`src/utils/kpfExport.ts`)**:
   - Compiles a complete Kindle Create project package:
     - `book.kcb`: Kindle Create project configuration JSON specifying book title, author, reflowable layout, and structural chapter demarcation.
     - `manuscript_kindle_ready.docx`: Pre-formatted DOCX generated directly from the existing `docxExport` engine, styled with native Heading 1/2 markers and embedded graphics for 1-click import into Amazon Kindle Create.
     - `resources/`: Unpacked chapter XHTML documents, CSS styling, and `ManifestFile`.
     - `KINDLE_PUBLISHING_GUIDE.md`: Comprehensive walkthrough explaining both direct Amazon KDP upload and Kindle Create 1-click export to `.kpf`.
3. **Enhanced Export Modal (`src/components/ExportModal.tsx`)**:
   - Sleek UI cards with clear format badges:
     - **Amazon Kindle & E-Reader EPUB (.epub)**: Primary choice for direct KDP upload.
     - **Kindle Create Companion Package (.kpf / .zip)**: Complete workspace bundle for Amazon Kindle Create.
     - **Microsoft Word (.docx)**: Word interior with dual Roman/Decimal pagination and embedded images.
     - **Markdown (.md)** & **Plain Text (.txt)**.
   - Real-time compilation status indicators and error resilience.

---

## 2. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ExportModal.tsx                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Amazon Kindle EPUB (.epub) [NEW]                              │  │
│  │    Direct KDP upload · All 13 Noir Plates · Interactive TOC       │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 2. Kindle Create Package (.kpf / .zip) [NEW]                     │  │
│  │    book.kcb · Kindle DOCX · ManifestFile · Resource Assets        │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 3. Microsoft Word (.docx)                                        │  │
│  │    Dual-section Roman/Arabic pagination · Embedded Cover & Ledger│  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 4. Markdown (.md) & Plain Text (.txt)                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│            │                                       │                   │
│            ▼                                       ▼                   │
│  ┌───────────────────────┐               ┌──────────────────────────┐  │
│  │ epubExport.ts         │               │ kpfExport.ts             │  │
│  │ - mimetype (STORED)   │               │ - book.kcb (JSON)        │  │
│  │ - container.xml       │               │ - manuscript.docx (BLOB) │  │
│  │ - content.opf         │               │ - resources/ (Images)    │  │
│  │ - nav.xhtml & toc.ncx │               │ - ManifestFile           │  │
│  │ - 19 section XHTMLs   │               │ - KINDLE_GUIDE.md        │  │
│  │ - Embedded binary JPGs│               │ - Compiles to .kpf / .zip│  │
│  └───────────────────────┘               └──────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Steps

### Step 1: Install `jszip` Dependency
- Add `jszip` (`^3.10.1`) and `@types/jszip` via `install_applet_package` to enable fast, zero-dependency in-browser zip archiving for both EPUB3 and Kindle Create bundles.

### Step 2: Implement EPUB 3.0 Exporter (`src/utils/epubExport.ts`)
- Construct pure HTML/XHTML templates for each section in `CHAPTERS`.
- Fetch all 14 images (`/assets/aistudio/...`, `/assets/chapters/...`) as binary `ArrayBuffer`s and store in `OEBPS/images/`.
- Generate `content.opf` with complete Dublin Core metadata (`dc:title`, `dc:creator`, `dc:identifier`, `dc:language`, `dc:rights`).
- Generate `nav.xhtml` honoring the Roman numeral front matter (`p. I`, `p. II`, `pp. III–IV`, `pp. V–VI`) and Chapter 1 starting at Page 1.
- Write `mimetype` with `{ compression: 'STORE' }` at the root as required by the EPUB standard.

### Step 3: Implement Kindle Create Companion Exporter (`src/utils/kpfExport.ts`)
- Generate `book.kcb` matching Kindle Create's configuration schema.
- Re-use `generateDocxBlob()` from `src/utils/docxExport.ts` to package the Kindle-optimized Microsoft Word document directly inside the zip.
- Generate `ManifestFile` and package the full set of chapter illustrations in `resources/`.
- Add `KINDLE_PUBLISHING_GUIDE.md` detailing the simple upload steps for Amazon KDP.
- Provide download triggers for both `.kpf` and `.zip` extensions.

### Step 4: Upgrade `ExportModal.tsx`
- Add modern, high-contrast export buttons with Kindle orange and violet accents for the new ebook formats.
- Add individual compilation loaders (`isExportingEpub`, `isExportingKpf`).
- Include helpful subtitle descriptions explaining which format to choose for which publishing goal.

### Step 5: Verification & Testing
- Validate TypeScript compilation via `lint_applet` and `compile_applet`.
- Verify EPUB structure complies with standard e-reader specifications (valid mimetype, spine, and manifest).
- Verify file downloads execute smoothly in-browser without network latency.

---

## 4. Verification Checklist

- [ ] `jszip` installed cleanly and integrated into build pipeline.
- [ ] EPUB3 file downloads with valid container, metadata, and embedded images.
- [ ] Table of Contents in EPUB matches front matter Roman numerals (`I`–`VI`) and Chapter 1 Page 1.
- [ ] All 13 neo-noir plates and Chapter 5 ledger diagram display inside exported chapters.
- [ ] Kindle Create package downloads with `book.kcb`, DOCX manuscript, and asset bundle.
- [ ] `compile_applet` passes with zero errors.
