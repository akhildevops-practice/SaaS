import React, { useEffect, useState } from "react";
import { Table, Modal, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Box, useMediaQuery } from "@material-ui/core";
import SearchBar from "components/SearchBar";
import { ReactComponent as DeleteIcon } from "../../../assets/documentControl/Delete.svg";
import { MdOutlineContentCopy } from "react-icons/md";
import useStyles from "./styles";
import axios from "apis/axios.global";
import UserPreview from "components/ReusableComponents/UserPreview";
import PopUpWindow from "components/ReusableComponents/UserPreview/PopUpWindow";
import { useSnackbar } from "notistack";
interface DataType {
  key: React.Key;
  type: string;
  date: string;
  createdBy: string;
  unit: string;
  department: string;
}

const RecycleBin = () => {
  const matches = useMediaQuery("(min-width:822px)");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [restoremodalVisible, setRestoreModalVisible] = useState(false);
  const [tableData, setTabledata] = useState([]);
  const [recordData, setRecordData] = useState<any>();
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [docTypeData, setDocTypeData] = useState([]);
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const [modalText, setModalText] = useState<any>(
    `You have selected ${selectedRowKeys?.length} records(s) to permanently delete. Continue?`
  );

  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  const hasSelected = selectedRowKeys.length > 0;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    getTableData();
  }, []);

  const columns: ColumnsType<DataType> = [
    {
      title: "Type",
      dataIndex: "type",
      render: (_: any, record: any) => {
        return (
          <div
            onMouseEnter={() => {
              setHoveredUserId(record.key);
            }}
            onMouseLeave={() => {
              setHoveredUserId(null);
            }}
          >
            {record.type}
            {hoveredUserId === record.id && (
              <div
                style={{
                  position: "absolute",
                  // top: "100%",
                  left: 0,
                  zIndex: 5000,
                }}
              >
                <UserPreview
                  record={record}
                  onOpenPopUp={() => {
                    setRecordData(record);
                    openPopUp();
                  }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Unit",
      dataIndex: "unit",
    },
    {
      title: "Department",
      dataIndex: "department",
    },
  ];

  const openPopUp = () => {
    setIsPopUpOpen(true);
  };

  const getTableData = async () => {
    function formatDate(inputDate: any) {
      if (inputDate != null) {
        const date = new Date(inputDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return "";
    }

    try {
      const response = await axios.get(`api/globalsearch/getRecycleBinList`);
      if (response.status === 200 || response.status === 201) {
        const data = response?.data
          ?.map((item: any, index: any) => {
            if (item?.documents?.length > 0) {
              if (item?.type === "Doctype") {
                setDocTypeData(item.documents[0]);
              }
              return item.documents?.map((document: any) => ({
                key: document._id,
                id: document._id,
                type: item.type,
                date: formatDate(document.createdAt), // or updatedAt based on your requirement
                createdBy: document.createdBy ? document.createdBy : "N/A",
                unit: document.locationName ? document.locationName : "N/A",
                department: document.entityName ? document.entityName : "N/A",
                unitType: document.unitType ? document.unitType : "N/A",
                unitOfMeasurement: document?.unitOfMeasurement
                  ? document?.unitOfMeasurement
                  : "N/A",
              }));
            }
            return null; // Return null for items with no documents
          })
          .filter(Boolean); // Filter out null values

        const flattenedData = data.flat();

        setTabledata(flattenedData);
      } else {
        enqueueSnackbar("Error fetching data ", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(`Error fetching data ${error}`, { variant: "error" });
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Function to handle the delete action
  const handleDelete = () => {
    setModalVisible(true); // Show the confirmation modal
  };

  const handleRestore = () => {
    setRestoreModalVisible(true); // Show the confirmation modal
  };

  const confirmDelete = async (ids: React.Key[]) => {
    const requestData = ids.map((id: any) => {
      const correspondingData: any = tableData.find(
        (data: any) => data.key === id
      );
      return {
        id,
        moduleType: correspondingData ? correspondingData.type : "Unknown",
      };
    });
    console.log("requestData", requestData);
    try {
      const response = await axios.post(
        `/api/globalsearch/deleteList`,
        requestData
      );
      console.log("response status", response);
      if (response.data.status === 409) {
        setModalText(
          "Cannot permanently remove this record as it has references elsewhere!!"
        );
        // enqueueSnackbar(
        //   "Cannot permanently remove this record as it has references elsewhere",
        //   {
        //     variant: "error",
        //     autoHideDuration: 5000,
        //   }
        // );
      } else if (response.status === 200 || response.status === 201) {
        getTableData();
        setModalVisible(false); // Close the modal
        setSelectedRowKeys([]); // Clear selected rows
      } else {
        // enqueueSnackbar("Error in deleting record!", {
        //   variant: "error",
        //   autoHideDuration: 2000,
        // });
        setModalText("Error deleting data!!");
        // setModalVisible(false);
      }
    } catch (error) {
      enqueueSnackbar("Error in deleting record!", {
        variant: "error",
        autoHideDuration: 2000,
      });
    }
  };

  const confirmRestore = async (ids: React.Key[]) => {
    const requestData = ids.map((id: any) => {
      const correspondingData: any = tableData.find(
        (data: any) => data.key === id
      );
      console.log("corresponding data", correspondingData);
      return {
        id,
        moduleType: correspondingData ? correspondingData.type : "Unknown",
      };
    });

    try {
      const response = await axios.post(
        `/api/globalsearch/restoreList`,
        requestData
      );
      if (response.status === 200 || response.status === 201) {
        getTableData();
        setRestoreModalVisible(false); // Close the modal
        setSelectedRowKeys([]); // Clear selected rows
      } else {
        enqueueSnackbar("Error in restoring record!", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    } catch (error) {
      enqueueSnackbar("Error in restoring record!", {
        variant: "error",
        autoHideDuration: 2000,
      });
    }
  };

  // Modal configuration
  const modal = (
    <Modal
      title="Alert"
      visible={modalVisible}
      onOk={() =>
        modalText.includes("Continue")
          ? confirmDelete(selectedRowKeys)
          : setModalVisible(false)
      }
      onCancel={() => {
        setModalVisible(false);
        setModalText(
          `You have selected ${selectedRowKeys.length} records(s) to permanently delete. Continue?`
        );
      }}
    >
      {/* {`You have selected ${selectedRowKeys.length} records(s) to permanently delete. Continue?`} */}
      {modalText}
    </Modal>
  );

  const modalRestore = (
    <Modal
      title="Alert"
      visible={restoremodalVisible}
      onOk={() => confirmRestore(selectedRowKeys)}
      onCancel={() => setRestoreModalVisible(false)}
    >
      {`You have selected ${selectedRowKeys.length} records(s) to restore. Continue?`}
    </Modal>
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <Tooltip title="Delete">
            <DeleteIcon onClick={handleDelete} className={classes.delete} />
          </Tooltip>
          <Tooltip title="Restore">
            <MdOutlineContentCopy onClick={handleRestore} className={classes.restore} />
          </Tooltip>

          <SearchBar
            placeholder="Search Record"
            name="query"
            values={"something"}
            handleChange={() => {}}
            handleApply={() => {}}
            endAdornment={true}
            handleClickDiscard={() => {}}
          />
        </Box>

        <span style={{ marginLeft: 8 }}>
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
        </span>
      </div>
      <Table
        className={classes.tableContainer}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableData}
      />
      {/* {DeleteConfirm Modal} */}
      {modal}

      {/* {RestoreConfirm Modal} */}
      {modalRestore}

      {/* {previewModal} */}
      {isPopUpOpen && (
        <PopUpWindow
          record={recordData}
          isPopUpOpen={isPopUpOpen}
          setIsPopUpOpen={setIsPopUpOpen}
          docTypeData={docTypeData}
        />
      )}
    </div>
  );
};

export default RecycleBin;
