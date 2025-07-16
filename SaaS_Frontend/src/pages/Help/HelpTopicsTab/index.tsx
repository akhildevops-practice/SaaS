// //React
// import { useEffect, useState } from "react";
// import { Document, Page, pdfjs } from 'react-pdf';
// import { useNavigate } from "react-router-dom";

// //Material UI
// import {
//   Theme,
//   makeStyles,
// } from "@material-ui/core";
// import { Tooltip } from "@material-ui/core";
// import { MdGetApp } from 'react-icons/md';
// import { MdChevronLeft } from 'react-icons/md';

// //AntD
// import { Col, Row, Select, Form, Button } from "antd";

// //Utils
// import axios from "apis/axios.global";
// import { API_LINK } from "config";

// //Others
// import saveAs from "file-saver";

// const useStyles = makeStyles<Theme>((theme: Theme) => ({
//   labelStyle: {
//     "& .ant-input-lg": {
//       border: "1px solid #dadada",
//     },
//     "& .ant-form-item .ant-form-item-label > label": {
//       color: "#003566",
//       fontWeight: "bold",
//       letterSpacing: "0.8px",
//     },
//   },
//   scroolBar: {
//     "&::-webkit-scrollbar": {
//       width: "8px",
//       height: "8px",
//     },
//     "&::-webkit-scrollbar-thumb": {
//       backgroundColor: '#808080'
//     },
//   },
//   item: {
//     marginBottom: "15px",
//     color: "#003566",
//     fontWeight: 600,
//     fontSize: "13px",
//     letterSpacing: ".8px",
//     transition: "text-decoration 0.3s", // Add transition effect for smooth animation
//     "&:hover": {
//       textDecoration: "underline", // Add underline on hover
//     },
//   },
// }));
type Props = {
  getAllTopics: any;
  selectedTopics: any;
  setSelectedTopics: any;
  setSelectedModuleId: any;
  selectedModuleId: any;
};
const HelpTopicsTab = ({
  getAllTopics,
  selectedTopics,
  setSelectedModuleId,
}: Props) => {
  // const classes = useStyles();
  // const navigate = useNavigate();

  // const [firstHelpForm] = Form.useForm();
  // const [helpData, setHelpData] = useState<any>(null);
  // const [pdfData, setPdfData] = useState<any>("");
  // const [modules, setModules] = useState<any>([]);
  // const [pageNumber, setPageNumber] = useState(1);
  // const [totalPages, setTotalPages] = useState<any>(null);
  // const [topicDetails, setTopicDetails] = useState<any>(null);
  // // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  // //   'pdfjs-dist/build/pdf.worker.min.js',
  // //   import.meta.url,
  // // ).toString();

  // useEffect(() => {
  //   getModules();
  // }, []);

  // const selectChange = (e: any) => {
  //   setPdfData(null)
  //   setSelectedModuleId(e);
  //   getAllTopics(e);
  //   viewDocuments(e);
  // };
  // let globalViewData: any = null;

  // const viewDocuments = async (moduleId: any = "") => {
  //   try {
  //     const response = await axios.get(
  //       API_LINK + `/api/moduleHelp/getTopicsByModuleId/${moduleId}`
  //     );
  //     const viewData = response.data[0].fileContent.data;
  //     globalViewData = viewData;

  //     const uint8Array = new Uint8Array(viewData);
  //     const blob = new Blob([uint8Array], { type: "application/pdf" });
  //     const pdfUrl = URL.createObjectURL(blob);
  //     setPdfData(pdfUrl);

  //     const topic = {
  //       topic: response.data[0].topic,
  //       fileContent: blob
  //     }
  //     setTopicDetails(topic)
  //     autoSelectDocuments();
  //     const pdf = await pdfjs.getDocument(pdfUrl).promise
  //     setTotalPages(pdf.numPages)
  //   } catch (error) {
  //     console.error("ERROR ", error)
  //   }
  // };

  // const autoSelectDocuments = async () => {
  //   setPageNumber(1)
  //   const uint8Array = new Uint8Array(globalViewData);
  //   const blob = new Blob([uint8Array], { type: "application/pdf" });
  //   const pdfUrl = URL.createObjectURL(blob);
  //   const pdf = await pdfjs.getDocument(pdfUrl).promise
  //   setTotalPages(pdf.numPages)
  //   setPdfData(pdfUrl);
  // };

  // const getDocument = async (index: any) => {
  //   setPageNumber(1)
  //   const uint8Array = new Uint8Array(selectedTopics[index].fileContent.data);
  //   const blob = new Blob([uint8Array], { type: "application/pdf" });
  //   const pdfUrl = URL.createObjectURL(blob);
  //   const pdf = await pdfjs.getDocument(pdfUrl).promise

  //   const topic = {
  //     topic: selectedTopics[index].topic,
  //     fileContent: blob
  //   }
  //   setTopicDetails(topic)
  //   setPdfData(pdfUrl);
  //   setTotalPages(pdf.numPages)
  // };

  // const getModules = async () => {
  //   try {
  //     const response = await axios.get(
  //       API_LINK + "/api/moduleHelp/getAllModules"
  //     );
  //     const modulesData = response.data;
  //     setModules(modulesData);

  //   } catch (error) {
  //     console.error("ERROR ", error)
  //   }
  // };

  // const handlePageChange = (newPageNumber: any) => {
  //   if (newPageNumber !== 0)
  //     setPageNumber(newPageNumber);
  // };

  // const handlePdfError = () => {
  //   setPageNumber(pageNumber - 1)
  // }

  // const downloadDocument = () => {
  //   saveAs(topicDetails.fileContent, topicDetails.topic + ".pdf");
  // }

  // useEffect(() => {
  //   if (modules[0]?._id) {
  //     firstHelpForm.setFieldsValue({ module: modules[0]?._id })
  //     getAllTopics(modules[0]?._id);
  //     viewDocuments(modules[0]?._id)
  //   }
  // }, [modules]);

  // return (
  //   <>
  //     <div style={{ display: "flex", height: '70vh' }}>
  //       <div style={{ display: "flex", height: "70vh" }}>
  //         <div style={{ flex: "2" }}>
  //           <div style={{ position: 'relative', right: '5px' }}>
  //             <Form form={firstHelpForm} layout="vertical">
  //               <Row gutter={[16, 16]}>
  //                 <Col span={18}>
  //                   <Form.Item label="Module " name="module">
  //                     <Select
  //                       defaultValue={helpData}
  //                       onChange={selectChange}
  //                     >
  //                       {modules.map((module: any) => (
  //                         <Select.Option key={module._id} value={module._id}>
  //                           {module.module}
  //                         </Select.Option>
  //                       ))}
  //                     </Select>
  //                   </Form.Item>
  //                 </Col>
  //               </Row>
  //             </Form>
  //           </div>
  //           <div
  //             className={`${classes.scroolBar} ${classes.labelStyle}`}
  //             style={{
  //               width: "25vw",
  //               height: "60vh",
  //               overflow: "auto",
  //               marginTop: "40px",
  //               position: 'relative',
  //               top: '-30px'
  //             }}
  //           >
  //             {selectedTopics.length > 0 ? (
  //               <div style={{ cursor: "pointer" }}>
  //                 {selectedTopics.map((topic: any, index: any) => (
  //                   <div
  //                     key={index}
  //                     className={classes.item}
  //                     onClick={() => {
  //                       getDocument(index);
  //                     }}
  //                   >
  //                     {topic.topic}
  //                   </div>
  //                 ))}
  //               </div>
  //             ) : (
  //               <div>No topics available</div>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //       <div style={{ flex: "4", border: "none" }}>
  //         {pdfData &&
  //           <>
  //             <div style={{
  //               marginBottom: '10px',
  //               textAlign: 'center',
  //               position: 'relative',
  //               top: '-75px'
  //             }}>
  //               <Button
  //                 type="primary"
  //                 onClick={() => navigate(-1)}
  //                 style={{
  //                   justifyContent: "center",
  //                   alignItems: "center",
  //                   display: "inline-flex",
  //                   top: "7px",
  //                   right: "30%",
  //                   color: 'black',
  //                   background: 'white',
  //                   border: '1px solid #DADADA'
  //                 }}
  //               >
  //                 <MdChevronLeft fontSize="small" />
  //                 Back
  //               </Button>
  //               <Button
  //                 type="primary"
  //                 onClick={() => handlePageChange(pageNumber - 1)}
  //                 style={{ marginRight: "25px" }}
  //               >
  //                 Previous Page
  //               </Button>
  //               <span
  //                 style={{
  //                   position: 'relative',
  //                   fontSize: '20px',
  //                   top: '3px',
  //                   marginRight: "25px"
  //                 }}
  //               >{pageNumber} / {totalPages}</span>
  //               <Button
  //                 type="primary"
  //                 onClick={() => handlePageChange(pageNumber + 1)}
  //               >
  //                 Next Page
  //               </Button>
  //               <Tooltip title="Download">
  //                 <MdGetApp
  //                   onClick={() => downloadDocument()}
  //                   style={{
  //                     position: 'relative',
  //                     left: '300px',
  //                     top: '10px',
  //                     fontSize: "30px",
  //                     color: '#000000'
  //                   }}
  //                 />
  //               </Tooltip>
  //             </div>
  //             <div
  //               style={{
  //                 border: '1px solid #ccc',
  //                 borderRadius: '4px',
  //                 overflow: 'hidden',
  //                 userSelect: 'none',
  //                 position: 'relative',
  //                 top: '-70px',
  //               }}
  //               onContextMenu={(e) => e.preventDefault()}
  //             >
  //               <Document file={pdfData}>
  //                 <div style={{ height: '75vh', overflow: 'auto' }} className={classes.scroolBar}>
  //                   <Page
  //                     pageNumber={pageNumber}
  //                     onLoadError={() => { handlePdfError() }}
  //                     width={1100}
  //                   />
  //                 </div>
  //               </Document>
  //             </div>
  //           </>
  //         }
  //       </div>
  //     </div>
  //   </>
  // );
  return (
    <>
    
    </>
  )
};

export default HelpTopicsTab;
