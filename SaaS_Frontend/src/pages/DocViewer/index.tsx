import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PdfReader from "./PdfReader";
import { Tabs } from "antd";

const { TabPane } = Tabs;

function DocViewer() {
  const [fileUrl, setFileUrl] = useState("");
  const [searchText, setSearchText] = useState("");
  const [clauseData, setClauseData] = useState({
    added_clauses: [],
    modified_clauses: [],
    removed_clauses: [],
  });
  const [selectedClause, setSelectedClause] = useState(null);
  const [activeTab, setActiveTab] = useState("added_clauses");

  const location = useLocation();

  useEffect(() => {
    let isMounted = true; // Track the component mounted state
  
    if (location?.state && isMounted) {
      setFileUrl(location?.state?.documentLink);
      console.log("checkdocview location state doc link", location?.state?.documentLink);
      console.log("checkdocview location state clause compare", location?.state?.clauseCompareResult);
  
      setClauseData({
        added_clauses: location?.state?.clauseCompareResult?.added_clauses,
        modified_clauses: location?.state?.clauseCompareResult?.modified_clauses,
        removed_clauses: location?.state?.clauseCompareResult?.removed_clauses,
      });
    }
  
    // Cleanup function to set `isMounted` to false if component is unmounted
    return () => {
      isMounted = false;
    };
  }, [location]);

  console.log("checkdocview location state clause compare", JSON.stringify(location?.state?.clauseCompareResult, null, 2));

  
  const handleClauseClick = (clause: any) => {
    setSelectedClause(clause);
    setSearchText(clause.text);
  };

  const renderClauseCategory = (items: any) => (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items?.map((item: any, index: any) => (
        <li
          key={index}
          style={{
            border: "1px solid #e0e0e0",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "1em",
            cursor: "pointer",
            backgroundColor: selectedClause === item ? "#e0e0e0" : "#fff",
            transition: "background-color 0.3s ease",
          }}
          onClick={() => handleClauseClick(item)}
        >
          {Object.entries(item).map(([key, value], idx) => {
            const v: any = value;
            return (
              <p key={idx}>
                <em>
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  :
                </em>{" "}
                {v}
              </p>
            );
          })}
        </li>
      ))}
    </ul>
  );

  const renderRemovedAndAddedClauses = (items: any) => (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items?.map((item: any, index: any) => (
        <li
          key={index}
          style={{
            border: "1px solid #e0e0e0",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "1em",
            cursor: "pointer",
            backgroundColor: selectedClause === item ? "#e0e0e0" : "#fff",
            transition: "background-color 0.3s ease",
          }}
          onClick={() => handleClauseClick(item)}
        >
          <p>
            <em>Text: </em>
            {item?.name}
          </p>
        </li>
      ))}
    </ul>
  );

  const tabItems = [
    {
      label: "Added",
      key: "added_clauses",
      children: renderRemovedAndAddedClauses(clauseData.added_clauses),
    },
    {
      label: "Modified",
      key: "modified_clauses",
      children: renderClauseCategory(clauseData.modified_clauses),
    },
    {
      label: "Removed",
      key: "removed_clauses",
      children: renderRemovedAndAddedClauses(clauseData.removed_clauses),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "80vh",
        width: "100vw",
        margin: "auto",
      }}
    >
      <div style={{ width: "35%", padding: "1em", overflowY: "auto" }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
        />
      </div>

      <div style={{ width: "65%" }}>
        <PdfReader url={fileUrl} searchText={searchText} />
      </div>
    </div>
  );
}

export default DocViewer;
