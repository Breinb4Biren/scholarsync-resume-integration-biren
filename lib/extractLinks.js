import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractLinksFromPDF(buffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
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
  } catch (error) {
    console.error('Error extracting links:', error);
    return [];
  }
}
