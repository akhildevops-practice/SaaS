import React, { useEffect, useState } from "react";
import ViewSDKClient from "./ViewSDKClient";
import getAppUrl from "utils/getAppUrl";
type Props = {
  url?: string;
  searchText?: string;
};

const PdfReader = ({ url, searchText }: Props) => {
  const [adobeViewer, setAdobeViewer] = useState<any>(null);
  const [searchObject, setSearchObject] = useState<any>(null);
  const realmName = getAppUrl();
  console.log("checkdoc1 realmname", realmName);
  
  useEffect(() => {
    const loadPDF = () => {
      const viewSDKClient = new ViewSDKClient(realmName); // Pass realmName here
      viewSDKClient.ready().then(() => {
        viewSDKClient
          .previewFile(
            "pdf-div",
            {
              defaultViewMode: "FIT_WIDTH",
              showAnnotationTools: true,
              showLeftHandPanel: true,
              showPageControls: true,
              showDownloadPDF: true,
              showPrintPDF: true,
              enableSearchAPIs: true, // Enable search APIs
            },
            url
          )
          .then((viewer: any) => {
            setAdobeViewer(viewer); // Save the viewer instance
          });
      });
    };

    loadPDF();
  }, [url]);
  useEffect(() => {
    if (adobeViewer && searchText) {
      executeSearch(searchText);
    }
  }, [searchText, adobeViewer]);

  const executeSearch = (term: string) => {
    if (!adobeViewer || !term) return;

    adobeViewer.getAPIs().then((apis: any) => {
      apis
        .search(term)
        .then((searchObj: any) => {
          setSearchObject(searchObj); // Save the searchObject for navigation
          searchObj
            .onResultsUpdate((result: any) => {
              console.log(result);
              // You can also update your UI with search result details if needed
            })
            .catch((error: any) => console.error("Error updating results:", error));
        })
        .catch((error: any) => console.error("Search error:", error));
    });
  };

  const searchNext = () => {
    if (searchObject) {
      searchObject.next().catch((error: any) => console.error("Next search error:", error));
    }
  };

  const searchPrevious = () => {
    if (searchObject) {
      searchObject.previous().catch((error: any) => console.error("Previous search error:", error));
    }
  };

  const clearSearch = () => {
    if (searchObject) {
      searchObject.clear().catch((error: any) => console.error("Clear search error:", error));
    }
  };

  return (
    <div className="mt-28">
      {/* <div className="search-bar">
        <input
          type="text"
          value={searchText || ""}
          onChange={(e) => executeSearch(e.target.value)}
          placeholder="Enter search term"
          className="form-control"
        />
        <button className="btn btn-primary" onClick={() => executeSearch(searchText)}>Search</button>
        <button className="btn btn-secondary" onClick={searchPrevious}>&lt;&lt; Previous</button>
        <button className="btn btn-secondary" onClick={searchNext}>Next &gt;&gt;</button>
        <button className="btn btn-primary" onClick={clearSearch}>Clear</button>
      </div> */}
      <div
        style={{ height: "100vh" }}
        id="pdf-div"
        className="full-window-div border border-gray-100 h-screen"
      ></div>
    </div>
  );
};

export default PdfReader;