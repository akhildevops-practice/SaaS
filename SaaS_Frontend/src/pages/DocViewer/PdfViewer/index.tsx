import React, { useState, useEffect, useRef } from "react";
// import { Document, Page, pdfjs } from "react-pdf";



// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type Props = {
  fileUrl?: any;
  searchText?: any;
};

function PdfViewer({ fileUrl, searchText }: Props) {
  const [numPages, setNumPages] = useState<any>(null);
  const viewerRef = useRef<any>(null);

  const onDocumentLoadSuccess = (numPages: any) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    if (!!searchText && !!viewerRef) {
      if (viewerRef?.current) {
        const textLayer = viewerRef?.current?.querySelectorAll(
          ".react-pdf__Page__textContent"
        );
        textLayer.forEach((layer: any) => {
          const text = layer.textContent || "";
          if (text.includes(searchText)) {
            layer.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    }
    console.log("checkdoc1 fileUrl", fileUrl);
  }, [searchText, fileUrl]);

  return (
    <div ref={viewerRef}>
      {/* <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document> */}
    </div>
  );
}

export default PdfViewer;
