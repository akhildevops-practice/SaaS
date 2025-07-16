import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { MdEdit, MdDelete } from 'react-icons/md';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Modal,
  Typography,
  TextField,
  IconButton,
  Divider,
} from "@material-ui/core";
import useStyles from "./style";
import ConfirmDialog from "components/ConfirmDialog";
import Table from "antd/es/table";
import { Pagination, PaginationProps } from "antd";
import { useRecoilState } from "recoil";
import {
  activityUpdateData,
  cipActionItemData,
  cipFormData,
} from "recoil/atom";
import axios from "apis/axios.global";
import AutoComplete from "components/AutoComplete";
import { debounce } from "lodash";
import { useSnackbar } from "notistack";
import formatQuery from "utils/formatQuery";
import ActivityUpdateTable from "./ActivityUpdateTable";

type Props = {
  isFormEdit: boolean;
  moduleName?: any;
};
const ActionItem = ({ isFormEdit, moduleName }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [templateData, setTemplateData] = useRecoilState(cipActionItemData);
  const [user, setUser] = useState([]);
  const [formData, setFormData] = useRecoilState(cipFormData);
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableData, setTableData] = useState([]);
  const [count, setCount] = useState<number>();
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const [deleteActionItem, setdeleteActionItem] = useState<any>();
  const [rowIndex, setRowIndex] = useState<any>();
  const HeadersData = ["Activity Comments", "Activity Date"];
  const FieldsData = ["comments", "date"];
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [activityUpdate, setActivityUpdate] =
    useRecoilState(activityUpdateData);

  useEffect(() => {
    const url = formatQuery(
      `/api/cip/`,
      {
        page: page,
        limit: rowsPerPage,
      },
      ["page", "limit"]
    );
    getData(url);
  }, []);

  useEffect(() => {
    setModalVisible(false);
    const url = formatQuery(
      `/api/cip/`,
      {
        page: page,
        limit: rowsPerPage,
      },
      ["page", "limit"]
    );
    getData(url);
  }, [formData]);

  const handleDelete = async (id: any) => {
    if (selectedData) {
      let result;
      try {
        result = await axios.delete(
          `/api/cip/deleteCIPActionItem/${deleteActionItem.id}`
        );
      } catch (error) {
        return error;
      }
    } else {
      const itemData = JSON.parse(JSON.stringify(formData.actionItems));
      setFormData((prev: any) => {
        itemData.splice(rowIndex, 1);
        handleClose();
        return { ...prev, actionItems: itemData };
      });
    }
  };

  const getData = async (url: any) => {
    setIsLoading(true);

    function formatDate(inputDate: any) {
      if (inputDate != null) {
        const date = new Date(inputDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
      }
      return "";
    }
    if (isFormEdit) {
      try {
        const res = await axios.get(
          `/api/cip/getCIPActionItemById/${formData.id}`
        );
        if (res?.data?.length > 0) {
          setCount(formData?.actionItems?.length);

          const val = res?.data?.map((item: any) => {
            return {
              id: item._id,
              actionItem: item.actionItem,
              description: item.description,
              owner: item.owner,
              startDate: formatDate(item.startDate),
              targetDate: formatDate(item.targetDate),
              status: item.status,
              attachments: item.attachments,
              activityUpdate: item.activityUpdate,
            };
          });
          setTableData(val);
          // formData.actionItems(val);
          // setFormData((prev: any) => ({
          //   ...prev,
          //   actionItems: val,
          // }));
          setIsLoading(false);
        }
      } catch (err) {
        console.log(err);
        // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
        setIsLoading(false);
      }
    } else {
      setTableData(formData?.actionItems ? formData?.actionItems : []);
      setIsLoading(false);
    }
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    const url = formatQuery(
      `/api/cip/`,
      {
        page: page,
        limit: pageSize,
      },
      ["page", "limit"]
    );
    getData(url);
  };

  let typeAheadValue: string;
  let typeAheadType: string;

  const getSuggestionListUser = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchUser();
  };

  const debouncedSearchUser = debounce(() => {
    getUser(typeAheadValue, typeAheadType);
  }, 50);

  const columns: ColumnsType<any> = [
    {
      title: "Action Item",
      dataIndex: "actionItem",
      key: "actionItem",
      width: 200,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
    },

    {
      title: "Owner",
      dataIndex: "owner",
      width: 600,
      key: "owner",
      render: (_: any, record: any) => {
        return record?.owner?.username;
      },
    },
    {
      title: "Target Date",
      dataIndex: "targetDate",
      width: 600,
      key: "targetDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 600,
      key: "status",
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record, index) => (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <IconButton
            onClick={() => {
              setIsEdit(true);
              setTemplateData(record);
              setModalVisible(true);
            }}
            style={{ fontSize: "16px" }}
          >
            <MdEdit style={{ fontSize: "18px" }} />
          </IconButton>
          <IconButton
            onClick={() => {
              handleOpen(record, index);
            }}
            style={{ fontSize: "16px" }}
          >
            <MdDelete style={{ fontSize: "18px" }} />
          </IconButton>
        </div>
      ),
    },
  ];

  const actionData: any = {
    isAction: true,
    actions: [
      {
        label: "MdEdit",
        icon: "icon",
        handler: () => console.log("handler"),
      },
    ],
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const handleModalCancel = () => {
    setSelectedData(null);
    setModalVisible(false);
    setTemplateData([]);
    setActivityUpdate([]);
    const url = formatQuery(
      `/api/cip`,
      {
        page: page,
        limit: rowsPerPage,
      },
      ["page", "limit"]
    );
    getData(url);
  };

  const handleOpen = (val: any, index: any) => {
    setOpen(true);
    setdeleteActionItem(val);
    setRowIndex(index);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isFormEdit) {
      try {
        const res = await axios.post(`/api/cip/createCIPActionItem`, {
          cipId: formData.id,
          actionItem: templateData.actionItem,
          description: templateData.description,
          startDate: templateData.startDate,
          targetDate: templateData.targetDate,
          status: templateData.status,
          attachments: templateData.attachments,
          activityUpdate: activityUpdate,
        });

        setFormData((prev: any) => ({
          ...prev,
          actionItems: [
            ...tableData,
            { ...templateData, activityUpdate: activityUpdate },
          ],
        }));
        setSelectedData(null);
        setModalVisible(false);
        setTemplateData([]);
        setActivityUpdate([]);
        getData("");
      } catch (err) {
        enqueueSnackbar("Error updating action item", { variant: "error" });
      }
    } else {
      if (templateData?.owner) {
        setFormData((prev: any) => ({
          ...prev,
          actionItems: prev.actionItems
            ? [
                ...prev.actionItems,
                { ...templateData, activityUpdate: activityUpdate },
              ]
            : [{ ...templateData, activityUpdate: activityUpdate }],
        }));
        setTemplateData([]);
        setActivityUpdate([]);
        getData("");
      } else {
        enqueueSnackbar("Please Enter Required field", { variant: "warning" });
      }
    }
  };

  const getUser = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=${value}`
      );
      const ops = res.data.allUser.map((obj: any) => ({
        id: obj.id,
        username: obj.username,
        locationName: obj.location.locationName,
        locationid: obj.location.id,
      }));
      setUser(ops);
    } catch (err) {
      console.log(err);
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
    }
  };

  const handleChange = (e: any, value: any[], fieldName: string) => {
    if (selectedData) {
      setSelectedData((prevData: any) => ({
        ...prevData,
        [fieldName]: value,
      }));
    } else {
      setTemplateData((prevData: any) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={() => handleDelete(deleteActionItem.id)}
      />
      <Modal
        open={modalVisible}
        onClose={handleModalCancel}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          height="500px !important"
          overflow="auto" // Enable vertical scrolling
          width="1000px !important"
          mx="auto"
          my={4}
          p={3}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div>
            <Typography variant="h6">
              {selectedData?.name ? selectedData.name : "Add Action Item"}
            </Typography>
            <Divider />
            <form onSubmit={handleSubmit}>
              <Grid container style={{ paddingTop: "30px" }}>
                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Action Item</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <TextField
                      fullWidth
                      name="actionItem"
                      value={templateData?.actionItem}
                      variant="outlined"
                      onChange={(e: any) =>
                        handleChange(e, e.target.value, "actionItem")
                      }
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Grid container item sm={12} md={1} />
                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Owner*</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <AutoComplete
                      suggestionList={user}
                      name={"Owner Name"}
                      keyName={"owner"}
                      formData={selectedData ? selectedData : templateData}
                      setFormData={
                        selectedData ? setSelectedData : setTemplateData
                      }
                      getSuggestionList={getSuggestionListUser}
                      labelKey="username"
                      multiple={false}
                      defaultValue={templateData?.owner}
                    />
                  </Grid>
                </Grid>

                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Start Date</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <TextField
                      fullWidth
                      name="startDate"
                      type="date"
                      value={templateData?.startDate}
                      onChange={(e: any) => {
                        handleChange(e, e.target.value, "startDate");
                      }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Grid container item sm={12} md={1} />
                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Target Date</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <TextField
                      fullWidth
                      name="targetDate"
                      type="date"
                      value={templateData?.targetDate}
                      variant="outlined"
                      onChange={(e: any) => {
                        handleChange(e, e.target.value, "targetDate");
                      }}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Status</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <TextField
                      fullWidth
                      name="status"
                      value={templateData?.status}
                      variant="outlined"
                      onChange={(e: any) =>
                        handleChange(e, e.target.value, "status")
                      }
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Grid container item sm={12} md={1} />
                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Description</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <TextField
                      fullWidth
                      name="description"
                      value={templateData?.description}
                      variant="outlined"
                      onChange={(e: any) =>
                        handleChange(e, e.target.value, "description")
                      }
                      size="small"
                      multiline
                      maxRows={2}
                    />
                  </Grid>
                </Grid>

                <Grid container item sm={12} md={12}>
                  <div style={{ padding: "15px", width: "100%" }}>
                    <div style={{ marginBottom: "5px" }}>
                      <strong>Activity Update</strong>
                    </div>
                    <ActivityUpdateTable
                      header={HeadersData}
                      fields={FieldsData}
                      data={activityUpdate}
                      setData={setActivityUpdate}
                      isAction={actionData.isAction}
                      actions={actionData.actions}
                      addFields={true}
                      label={"Add Item"}
                    />
                  </div>
                </Grid>
                <Grid
                  container
                  item
                  sm={12}
                  md={12}
                  style={{ display: "flex", justifyContent: "end" }}
                >
                  <Grid item style={{ paddingRight: "10px" }}>
                    <Button onClick={handleModalCancel}>Cancel</Button>
                  </Grid>
                  <Grid item>
                    <Button
                      style={{
                        backgroundColor: "#0E497A",
                        color: "#ffffff",
                      }}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </div>
        </Box>
      </Modal>

      <div
        style={{
          minWidth: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "10px",
        }}
      >
        <div style={{ marginBottom: "5px", alignItems: "center" }}>
          <strong>Action Item</strong>
        </div>
        <Button
          onClick={() => {
            setTemplateData([]);
            setActivityUpdate([]);
            setModalVisible(true);
          }}
          style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
        >
          Add
        </Button>
      </div>
      <div data-testid="custom-table" className={classes.tableContainer}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="middle"
          rowKey={"id"}
          className={classes.documentTable}
          onRow={(record) => ({
            onMouseEnter: () => handleMouseEnter(record),
            onMouseLeave: handleMouseLeave,
          })}
        />
        <div className={classes.pagination}>
          <Pagination
            size="small"
            current={page}
            pageSize={rowsPerPage}
            total={count}
            showTotal={showTotal}
            showSizeChanger
            showQuickJumper
            onChange={(page, pageSize) => {
              handleChangePageNew(page, pageSize);
            }}
          />
        </div>
      </div>
      {/* ) : (
          <div>
            <div className={classes.emptyTableImg}>
              <img
                src={EmptyTableImg}
                alt="No Data"
                height="400px"
                width="300px"
              />
            </div>
            <Typography align="center" className={classes.emptyDataText}>
              Let’s begin by adding an Action Item
            </Typography>
          </div>
        )} */}
      {/* </div> */}

      {isLoading && (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

export default ActionItem;
