import { summarizeText } from './summarize.js';
import { detectLanguage, translateText } from './translation.js';

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('uploadBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('pdfInput');
    const file = fileInput.files[0];

    if (file && file.type === 'application/pdf') {
      const fileReader = new FileReader();

      fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(async function (pdf) {
          const numPages = pdf.numPages;
          let fullText = '';

          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            try {
              const page = await pdf.getPage(pageNum);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item) => item.str).join(' ');
              fullText += pageText + '\n\n';
            } catch {}
          }

          document.getElementById('textOutput').textContent = 'Detecting language...';

          try {
            const detectedLanguage = await detectLanguage(fullText);
            if (detectedLanguage !== 'en') {
              document.getElementById('textOutput').textContent = 'Translating to English...';
              fullText = await translateText(fullText, 'en');
            }

            document.getElementById('textOutput').textContent = 'Summarizing...';
            const summary = await summarizeText(fullText);
            document.getElementById('textOutput').textContent = summary;
          } catch {
            document.getElementById('textOutput').textContent = 'Error during processing. Please try again.';
          }
        }).catch(() => {
          document.getElementById('textOutput').textContent = 'Error loading PDF. Please check the file and try again.';
        });
      };

      fileReader.readAsArrayBuffer(file);
    } else {
      alert('Upload a PDF cutie');
    }
  });
});