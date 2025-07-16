import React, { useEffect, useState } from "react";
import { Table, Modal, Tooltip, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { IconButton } from "@material-ui/core";

import CloseIconImageSvg from "assets/documentControl/Close.svg";
import useStyles from "./styles";
import BoMPage from "components/BoM";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import checkRoles from "utils/checkRoles";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { API_LINK } from "config";
const BOM = () => {
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableData, setTabledata] = useState([]);
  const userDetails = getSessionStorage();
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [childModalVisible, setChildModalVisible] = useState<boolean>(false);
  const [modalId, setModalId] = useState<any>();
  const [modalData, setModalData] = useState<any>({});
  const [childModalData, setChildModalData] = useState<any>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const isOrgAdmin = checkRoles("ORG-ADMIN");

  useEffect(() => {
    getAllbom();
  }, [modalVisible]);

  const handleCreate = () => {
    setModalVisible(true);
  };
  // console.log("childmodalData", childModalData);
  const handleChildModalLinkClick = (id: any) => {
    setChildModalVisible(true);
    getChildEntityTypeswithEntites(id);
  };
  const columns: ColumnsType<any> = [
    {
      title: "BoM",
      dataIndex: "bom",
      render: (_: any, data: any, index: number) => (
        <>
          <div
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => {
              console.log("data in undeline", data);
              setModalVisible(true);
              setModalId(data?.bom?._id);
              setIsEdit(true);
              setModalData(data);
            }}
          >
            {data?.entity?.entityName}
          </div>
        </>
      ),
    },
    {
      title: "No Of Items",
      dataIndex: "noOfItems",
      render: (_: any, data: any, index: number) => (
        <>
          <div
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => {
              console.log("data in undeline", data);
              handleChildModalLinkClick(data?.bom?._id);

              // setChildModalData(data?.family);
            }}
          >
            {data?.family?.length}
          </div>
        </>
      ),
    },
    {
      title: "No of Categories",
      dataIndex: "noOfCategories",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      render: (_: any, data: any, index: number) => (
        <>
          <div>{data?.entity?.location?.locationName}</div>
        </>
      ),
    },
    {
      title: "Action",
      render: (_: any, data: any, index: number) => (
        <div style={{ display: "flex", alignItems: "left" }}>
          {isOrgAdmin && (
            <IconButton onClick={() => handleDelete(data)}>
              {/* <Popconfirm
                  placement="bottom"
                  title={"Are you sure to delete Cara"}
                  onConfirm={() => {
                    console.log("data in handledelte", data);
                    handleDelete(data);
                  }}
                  okText="Yes"
                  cancelText="No"
                  // disabled={showData ? false : true}
                > */}
              <Tooltip title="Delete BoM">
                <CustomDeleteICon
                  style={{
                    fontSize: "15px",
                    marginRight: "2px",
                    height: "20px",
                  }}
                />
              </Tooltip>

              {/* </Popconfirm> */}
            </IconButton>
          )}
        </div>
      ),
    },
  ];
  const handleDelete = async (data: any) => {};
  const getChildEntityTypeswithEntites = async (id: any) => {
    try {
      const result = await axios.get(
        `${API_LINK}/api/bom/getAllEntityTypeswithEntitiesForBom/${id}`
      );
      // console.log("result", result?.data);
      if (result.data) {
        setChildModalData(result?.data);
      } else {
        setChildModalData([]);
      }
    } catch (error) {}
  };

  const transformedData = childModalData?.map((entityType: any) => {
    return {
      entityTypeName: entityType.name,
      entities: entityType.entities.map((entity: any) => entity.entityName),
    };
  });

  const childColumns = [
    {
      title: "Entity Type Name",
      dataIndex: "entityTypeName",
      key: "entityTypeName",
    },
    {
      title: "Entity Name",
      dataIndex: "entities",
      key: "entities",
    },
  ];
  const handleChildModalCancel = () => {
    setChildModalData([]);
    setChildModalVisible(false);
  };
  const handleItemsClick = async (data: any) => {};
  const getAllbom = async () => {
    const result = await axios.get(
      `/api/bom/getAllBoM?organizationId=${userDetails?.organizationId}`
    );
    if (result.data?.length > 0) {
      setTabledata(result.data);
    }
  };
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          style={{
            backgroundColor: "#003059",
            color: "white",
            marginBottom: "10px",
          }}
          onClick={handleCreate}
        >
          Create BoM
        </Button>
      </div>
      <div>
        <Table
          className={classes.tableContainer}
          //   rowSelection={rowSelection}
          columns={columns}
          dataSource={tableData}
          pagination={false}
        />

        <BoMPage
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          modalId={modalId}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          modalData={modalData}
        ></BoMPage>
        <Modal
          title="BoM"
          visible={childModalVisible}
          footer={null}
          onCancel={handleChildModalCancel}
          width={1200}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
          style={{ maxHeight: "800px", overflowY: "auto" }}
        >
          <Table
            className={classes.tableContainer}
            dataSource={transformedData}
            columns={childColumns}
            pagination={false}
          />
        </Modal>
      </div>
    </>
  );
};
export default BOM;
