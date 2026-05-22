const pdfFilename = 'Gregory_Rzeczko_Resume_2026.pdf';
const docxFilename = 'Gregory_Rzeczko_Resume_2026.docx';

export const RESUME_FILES = {
  pdf: {
    label: 'Download PDF Resume',
    filename: pdfFilename,
    href: new URL(`../../resumes/${pdfFilename}`, import.meta.url).href,
  },
  docx: {
    label: 'Download DOCX Resume',
    filename: docxFilename,
    href: new URL(`../../resumes/${docxFilename}`, import.meta.url).href,
  },
};
