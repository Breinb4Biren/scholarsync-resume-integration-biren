import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist';

export async function extractLinksFromPDF(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjsLib.getDocument({ data });

  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const hyperlinks = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const annotations = await page.getAnnotations();

    annotations.forEach((annot) => {
      if (annot.url) {
        hyperlinks.push(annot.url);
      }
    });
  }

  return hyperlinks;
}
