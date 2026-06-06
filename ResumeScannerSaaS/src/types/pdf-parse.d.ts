declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numTextPages: number;
    text: string;
    info: any;
    metadata: any;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer | Uint8Array, options?: any): Promise<PDFData>;
  export default pdfParse;
}
