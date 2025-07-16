import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import { PdfProps } from "./types";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfDocViewer({ src }: PdfProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function nextPage() {
    setPageNumber((v) => ++v);
  }

  function prevPage() {
    setPageNumber((v) => --v);
  }

  // const url=
  // `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
  // encodeURIComponent(src);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* <button onClick={prevPage} disabled={pageNumber <= 1}>
        Previous
      </button>
      <button onClick={nextPage} disabled={pageNumber >= (numPages ?? -1)}>
        Next
      </button>
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="my-react-pdf"
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <p>
        Page {pageNumber} of {numPages}
      </p> */}
       <div style={{ height: 800 , overflowY: "scroll" }}>
       <Document
          file={src}
          onLoadSuccess={({ numPages }) => {
            // console.log("Loaded PDF with pages:", numPages);
            setNumPages(numPages);
          }}
          loading={<p>Loading PDF...</p>}
          error={<p>Failed to load PDF.</p>}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page key={index + 1} pageNumber={index + 1} />
          ))}
        </Document> 
      </div>
    </div>
  );
}