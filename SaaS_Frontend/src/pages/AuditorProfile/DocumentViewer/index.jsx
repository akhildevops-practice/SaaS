import React, { useEffect, useState } from "react";
import FileViewer from "react-file-viewer";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import { useSnackbar } from "notistack";
import { useMediaQuery } from "@material-ui/core";
import PdfDocViewer from "components/Document/DocumentTable/DocumentViewDrawer/PdfDocViewer";
function DocumentViewerAudit({ fileLink, status = true }) {
  const { enqueueSnackbar } = useSnackbar();
  const appUrl = process.env.REACT_APP_REDIRECT_URL;
  let url, docs, filePath, fileType;
  const [viewerURL, setViewerURL] = useState(null);
  const matches = useMediaQuery("(min-width:786px)");
  console.log("fileLink",fileLink)

  useEffect(() => {
    const fetchViewerURL = async () => {
      try {
        if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
          const response = await axios.post(
            `${API_LINK}/api/documents/viewerOBJ`,
            { documentLink: fileLink }
          );
          console.log("response from api", response);
          const fetchedViewerURL = response.data;
          setViewerURL(fetchedViewerURL);
        }
      } catch (error) {
        // enqueueSnackbar("Error in Fetching Document", {
        //   variant: "error",
        // });
        console.error("Error fetching viewer URL:", error);
        // Handle errors as needed
      }
    };
    fetchViewerURL();
  }, [fileLink]);

  if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
    // if (
    //   (appUrl.includes("localhost") || appUrl.includes("goprodle")) &&
    //   viewerURL?.split(".").pop() === "pdf"
    // ) {
    //   console.log("inside pdf if");
    //   url =
    //     `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
    //     encodeURIComponent(viewerURL);
    //   filePath = url;
    // } else {
    console.log("inside else of not pdf");
    url = viewerURL;
    docs = [
      {
        uri: url,
      },
    ];
    filePath = docs[0].uri;
    // }
    fileType = viewerURL?.split(".").pop();
  } else {
    if (appUrl.includes("localhost") || appUrl.includes("goprodle")) {
      url =
        `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
        encodeURIComponent(fileLink);

      docs =
        `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
        encodeURIComponent(fileLink);

      filePath = docs;
    } else {
      url = fileLink;

      docs = [
        {
          uri: url,
        },
      ];
      filePath = docs[0].uri;
      console.log("filepath", filePath);
    }
    fileType = fileLink?.split(".").pop();
    console.log("fileLink?.split", fileLink?.split(".").pop());
  }

  if (fileType === "pdf") {
    return (
      <>
        <PdfDocViewer src={url} />
      </>
    );
  }

  const supportedfiles = [
    "png",
    "jpeg",
    "jpg",
    "docx",
    "bmp",
    "tif",
    "tiff",
    "webp",
  ];

  console.log("fileLink fina/",filePath)
  if (supportedfiles.includes(fileType)) {
    return (
      <div style={{ height: matches ? 480 : "auto" }}>
        <FileViewer fileType={fileType} filePath={filePath} />
      </div>
    );
  } else {
    return (
      <div style={{ height: matches ? 480 : "auto" }}>
        <p>{`Not Supported File Type: ${fileType}`}</p>
      </div>
    );
  }
}

export default React.memo(DocumentViewerAudit);
