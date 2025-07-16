import  { useEffect, useState } from "react";
import {
  Button,
  Layout,
  Form,
  Spin,
  InputNumber,
  Modal,
} from "antd";
import useStyles from "./styles";
import { AiOutlineSend, AiOutlineLoading } from "react-icons/ai";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { MdFilterList } from 'react-icons/md';
import {
  Card,
  CardContent,
  Typography,
  TextareaAutosize,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import DynamicFrom from "./DynamicForm";
import { useLocation } from "react-router-dom";
const SemanticSearch = () => {
  const classes = useStyles();
  const userDetails = getSessionStorage();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [result, setResult] = useState<any>([]);
  const [searchText, setSearchText] = useState<any>("");
  const [selectedTopK, setSelectedTopK] = useState<any>(10);
  const [loading, setLoading] = useState<any>(false);
  const [filterModalOpen, setFilterModalOpen] = useState<any>(false);
  const [isFilterApplied, setIsFilterApplied] = useState<any>(false);

  const [expandedText, setExpandedText] = useState<any>({});
  const [modalVisible, setModalVisible] = useState<any>(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [searchClicked, setSearchClicked] = useState<any>(false); // New state variable


  //for filter modal
  const [filters, setFilters] = useState<any>([]);
  useEffect(() => {
    console.log("checkai result", result);
  }, [result]);

  useEffect(() => {
    console.log("checkdoc locaiton state", location?.state);
    if (location?.state?.selectedText) {
      setSearchText(location?.state?.selectedText);
      setIsFilterApplied(false);
      handleSearchFromUrl(location?.state?.selectedText);
    }
  }, [location]);
  const handleTopKChange = (value: any) => {
    setSelectedTopK(value);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearchFromUrl = async (searchTextArg: any = "") => {
    try {
      setLoading(true);
      setSearchClicked(true); // Set searchClicked to true when search is clicked
      const body: any = {
        query: searchTextArg,
        top_k: selectedTopK,
        organizationId: userDetails?.organizationId,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/search`,
        body
      );
      if (response?.status === 200 || response?.status === 201) {
        setLoading(false);
        console.log("checkai result", JSON.parse(response?.data?.response));
        const result_array = JSON.parse(response?.data?.response);
        setResult(result_array);
      } else {
        enqueueSnackbar("Error in fetching search results", {
          variant: "error",
        });
        setResult([]);
        setLoading(false);
      }

      //   console.log("checkai response", response?.data?.response);
    } catch (error) {
      setLoading(false);
      setResult([]);
      enqueueSnackbar("Error in fetching search results", {
        variant: "error",
      });
      console.log("error in semantic search api", error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setSearchClicked(true); // Set searchClicked to true when search is clicked
      if (isFilterApplied) {
        const body: any = {
          query: searchText,
          top_k: selectedTopK,
          filters: [filters],
          filter: filters,
        };
        const response = await axios.post(
          `/api/documents/filterByMetaData`,
          body
        );
        console.log("Response:", response);
        if (response.status === 200 || response?.status === 201) {
          if (response?.data?.length) {
            console.log("here in res.data");

            const py_body = {
              docIds: response.data?.map((doc: any) => doc?.documentId),
              query: searchText,
              top_k: selectedTopK,
            };
            const py_response = await axios.post(
              `${process.env.REACT_APP_PY_URL}/pyapi/getDocWithIds`,
              py_body
            );

            console.log("Py Response:", py_response);
            if (py_response?.status === 200 || py_response?.status === 201) {
              if (py_response?.data?.response?.length) {
                const result_array = JSON.parse(py_response?.data?.response);
                setResult(result_array);
                setLoading(false);
              } else {
                enqueueSnackbar("No results found", {
                  variant: "info",
                });
                setResult([]);
                setLoading(false);
              }
            } else {
              enqueueSnackbar("Error in fetching search results", {
                variant: "error",
              });
              setResult([]);
              setLoading(false);
            }
          }
        }
      } else {
        const body: any = {
          query: searchText,
          top_k: selectedTopK,
          organizationId: userDetails?.organizationId,
        };
        const response = await axios.post(
          `${process.env.REACT_APP_PY_URL}/pyapi/search`,
          body
        );
        if (response?.status === 200 || response?.status === 201) {
          setLoading(false);
          console.log("checkai result", JSON.parse(response?.data?.response));
          const result_array = JSON.parse(response?.data?.response);
          setResult(result_array);
        } else {
          enqueueSnackbar("Error in fetching search results", {
            variant: "error",
          });
          setResult([]);
          setLoading(false);
        }
      }

      //   console.log("checkai response", response?.data?.response);
    } catch (error) {
      setLoading(false);
      setResult([]);
      enqueueSnackbar("Error in fetching search results", {
        variant: "error",
      });
      console.log("error in semantic search api", error);
    }
  };

  const highlightText = (text: any, highlight: any) => {
    console.log("checks text and highlight", text, highlight);

    const parts = text?.split(new RegExp(`(${highlight})`, "gi"));
    return parts?.map((part: any, index: any) =>
      part?.toLowerCase() === highlight?.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: "yellow" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };


  const toggleExpandText = (index: any) => {
    setExpandedText((prev: any) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const renderText = (text: string, index: number) => {
    const shouldShowMore = text?.length > 200;
    const displayText = expandedText[index] ? text : text?.slice(0, 200);

    return (
      <Typography variant="body2" style={{ marginTop: "8px", color: "#333" }}>
        {highlightText(displayText, searchText)}
        {shouldShowMore && (
          <>
            {!expandedText[index] && "..."}
            <Button
              size="small"
              color="primary"
              // onClick={() => toggleExpandText(index)}
              onClick={() => handleShowMore(result[index])}
              style={{
                marginLeft: "5px",
                textTransform: "none",
                fontWeight: "normal",
              }}
            >
              {expandedText[index] ? "Show less" : "Show more"}
            </Button>
          </>
        )}
      </Typography>
    );
  };

  const handleShowMore = (doc:any) => {
    setSelectedDoc(doc);
    setModalVisible(true);
  };



  return (
    <Layout className={classes.chatLayout}>
      <div className={classes.inputContainer}>
        <Form.Item
          label="Search Query"
          style={{ marginRight: "20px", marginLeft: "10px" }}
        >
          <TextareaAutosize
            minRows={4}
            placeholder="Enter Text to Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyPress}
            style={{ height: "32px", width: "250px", minWidth: "120px" }}
          />
        </Form.Item>
        <Button
          className={classes.sendButton}
          type="primary"
          onClick={handleSearch}
          icon={loading ? <AiOutlineLoading /> : <AiOutlineSend />}
          loading={loading}
        >
          Search
        </Button>
        
        {searchClicked && ( // Conditionally render after search is clicked
          <>
            <Form.Item
              label="No. of Results"
              style={{ marginRight: "20px", marginLeft: "10px" }}
            >
              <InputNumber
                min={1}
                max={20}
                defaultValue={10}
                value={selectedTopK}
                onChange={handleTopKChange}
              />
            </Form.Item>
            <Button
              type="text"
              icon={<MdFilterList />}
              onClick={() => setFilterModalOpen(true)}
            />
          </>
        )}
       
      </div>
      {filterModalOpen && (
        <Modal
          open={filterModalOpen}
          onCancel={() => setFilterModalOpen(false)}
          title="Filter"
          footer={null}
          width={800}
        >
          <DynamicFrom
            searchText={searchText}
            topK={selectedTopK}
            setIsFilterApplied={setIsFilterApplied}
            setFilters={setFilters}
            setFilterModalOpen={setFilterModalOpen}
          />
        </Modal>
      )}
      {loading ? (
        <Spin />
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            padding: "10px",
            width: "100%",
          }}
        >
          {result?.map((obj: any, index: any) => (
            <Card
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                margin: "10px",
                maxWidth: "450px",
                width: "100%",
                minHeight: "300px", // Set a minimum height for consistent card height
                height: "100%", // Ensures card expands to content if necessary
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start", // Ensures even vertical spacing
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    component="a"
                    href={obj.documentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "#9FBFDF",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      color: "#003366",
                      textDecoration: "none",
                      fontWeight: "bold",
                      flex: 1,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        textDecoration: "underline",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "150px", // Restrict width to ensure ellipsis
                        display: "inline-block",
                      }}
                      title={obj?.metadata?.documentName} // Show full docName on hover
                    >
                      {obj?.metadata?.documentName?.length > 45
                        ? `${obj.metadata?.documentName.slice(0, 45)}...`
                        : obj?.metadata?.documentName}  
                    </span>
                    <span style={{ marginLeft: "8px" }}>
                      {(obj?.similarity * 100).toFixed(2)}%
                    </span>
                  </Typography>
                </div>
                {renderText(obj?.chunkText, index)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={null} // Remove title here to allow custom styling in the content
        footer={null}
        width={800}
      >
        <Card
          style={{
            // border: "1px solid #ddd",
            // borderRadius: "8px",
            // boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            margin: "10px",
            maxWidth: "100%",
          }}
        >
          <CardContent>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <Typography
                variant="h6"
                component="a"
                href={selectedDoc?.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#9FBFDF",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  color: "#003366",
                  textDecoration: "none",
                  fontWeight: "bold",
                  flex: 1,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    textDecoration: "underline",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "200px",
                    display: "inline-block",
                  }}
                  title={selectedDoc?.documentName}
                >
                  {selectedDoc?.documentName}
                </span>
                <span style={{ marginLeft: "8px" }}>
                  {(selectedDoc?.similarity * 100).toFixed(2)}%
                </span>
              </Typography>
            </div>
            <div
              style={{
                maxHeight: "400px", // Limits the height of the text content in modal
                overflowY: "auto", // Adds vertical scroll if text exceeds the max height
                padding: "10px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Typography variant="body2" style={{ color: "#333" }}>
                {highlightText(selectedDoc?.chunkText, searchText)}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Modal>
    </Layout>
  );
};

export default SemanticSearch;
