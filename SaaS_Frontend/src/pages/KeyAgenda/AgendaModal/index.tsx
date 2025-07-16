import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Box,
  Button,
  Grid,
  Modal,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
import useStyles from "./style";
import axios from "apis/axios.global";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  orgFormData,
} from "recoil/atom";
import DynamicFormFields from "components/DynamicFormFields";
import MultiUserDisplay from "components/MultiUserDisplay";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import CustomButton from "components/CustomButton";
import { AnyARecord } from "dns";
import { agendaDefaultData } from "schemas/agenda.schema";
interface AgendaModalProps {
  closeModal: () => void;
  meetingType: AnyARecord;
  // Add any other necessary props here
}

const defaultFormData = { meetingType: "", name: "" };
const AgendaModal: React.FC<AgendaModalProps> = (closeModal, meetingType) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [formData, setFormData] = useRecoilState<any[]>(agendaDefaultData);
  const [addfocusArea, setFocusArea] = useState<string>();
  const [agendas, setAgendas] = useState<string[]>([]);
  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  useEffect(() => {
    getData();
  }, []);

  // useEffect(() => {
  //   if (selectedData) {
  //     setFormData({
  //       auditFocus: selectedData.auditFocus || "",
  //       areas:
  //         selectedData.areas?.map((area: string) => ({ name: area })) || [],
  //     });
  //   } else {
  //     setFormData({ auditFocus: "", areas: [{ name: "" }] });
  //   }
  // }, [selectedData]);

  const getData = async () => {
    console.log("inside get data of modal");
    setIsLoading(true);
    try {
      const res = await axios.get(
        `api/mrm/getAgendaByMeetingType/${meetingType}`
      );
      if (res?.data) {
        const val = res?.data.map((item: any) => {
          return {
            name: item.name,
            meetingType: item.meetingType,
            organizationId: item.organizationId,
            id: item.id,
          };
        });
        setAgendas(val);
        setFormData(val);
        setIsLoading(false);
      } else {
        setFormData([defaultFormData]);
        setIsLoading(false);
      }
    } catch (err) {
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleLinkClick = (text: string) => {
    const selected = formData.find((item: any) => item.name === text);
    setSelectedData(selected);

    setModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    // {
    //   title: "Focus Area",
    //   dataIndex: "auditFocus",
    //   key: "auditFocus",
    //   width: 150,
    //   // render: (text) => <a onClick={() => handleLinkClick(text)}>{text}</a>,
    //   render: (record: any) => (
    //     <div
    //       style={{
    //         textDecorationLine: "underline",
    //         cursor: "pointer",
    //       }}
    //     >
    //       <div
    //         className={classes.clickableField}
    //         onClick={() => handleLinkClick(record)}
    //       >
    //         {record}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Agenda Name",
      dataIndex: "agendas",
      width: 600,
      render: (_, record) => {
        console.log("record", record);
        const formattedAreas = record?.map((name: string) => ({
          name: name,
        }));
        return <MultiUserDisplay data={formattedAreas} name="name" />;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <IconButton
          onClick={() => {
            handleDelete(record);
          }}
          style={{ padding: "10px" }}
        >
          {/* <DeleteOutline /> */}
          <CustomDeleteICon width={20} height={20} />
        </IconButton>
        // </div>
      ),
    },
  ];

  const handleDelete = async (record: any) => {
    try {
      await axios.delete(`/api/audit-settings/deleteAgendaById/${record.id}`);
      getData();
    } catch (error) {
      // Error handling
      console.log("Error deleting agenda", error);
    }
  };

  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // if (name === "agenda") {
    //   const updatedAreas = formData.areas.map((area: any) => area.name);
    //   setSelectedData((prevData: any) => ({
    //     ...prevData,
    //     [name]: updatedAreas,
    //   }));
    // }
  };

  const handleModalCancel = () => {
    setSelectedData(null);
    setModalVisible(false);
    getData();
  };

  const handleSubmit = async () => {
    if (agendas) {
      // Update existing Focus Area
      try {
        await axios.put(`api/mrm/updateAgenda/${selectedData.id}`, {
          name: selectedData.auditFocus,
          // meetingType: formData.meetingType,
          organizationId: organizationId,
        });
        setSelectedData(null);
        setModalVisible(false);
        getData();
      } catch (err) {
        console.log("Error updating audit type", err);
      }
    } else {
      try {
        await axios.post(`/api/mrm/createAgenda`, {
          // name: formData.name,
          // meetingType: formData.meetingType,
          organizationId: organizationId,
        });
        // setFormData(defaultFormData);
        // setSelectedData(null);
        setModalVisible(false);
        getData();
      } catch (err) {
        console.log("Error creating agenda", err);
      }
    }
  };
  console.log("formData", formData);
  return (
    <>
      <Modal
        open={true}
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
          // width={600}
          height="300px !important"
          overflow="auto"
          width="40vW !important"
          mx="auto"
          my={4}
          p={3}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div>
            <Typography variant="h6">
              {selectedData ? "Edit Agenda" : "Add Agenda"}
            </Typography>
            <Divider />
            <form>
              <div
                style={{
                  display: "flex",
                  // alignItems: "center",
                  fontFamily: "poppinsregular",
                }}
              >
                <Grid item sm={2} md={2} className={classes.formTextPadding}>
                  <strong>Agenda Name*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid
                  item
                  sm={12}
                  md={9}
                  // style={{ marginRight: "-800px" }}
                  className={classes.formBox}
                >
                  <DynamicFormFields
                    data={formData}
                    name="agenda"
                    setData={setFormData}
                    keyName="name"
                  />
                </Grid>
              </div>

              <Box width="100%" display="flex" justifyContent="center" pt={2}>
                <Button
                  className={classes.buttonColor}
                  variant="outlined"
                  onClick={handleModalCancel}
                >
                  Cancel
                </Button>

                <CustomButton
                  text="Submit"
                  handleClick={handleSubmit}
                ></CustomButton>
              </Box>
            </form>
            {/* )} */}
          </div>
        </Box>
      </Modal>
      {/* <>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingBottom: "10px",
          }}
        >
          <Button
            onClick={() => {
              setModalVisible(true);
              setFormData({ auditFocus: "", areas: [{ name: "" }] });
            }}
            style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
          >
            Add
          </Button>
        </div>

        {formData && Array.isArray(formData) && formData.length !== 0 ? (
          <div data-testid="custom-table" className={classes.tableContainer}>
            <Table
              columns={columns}
              dataSource={formData}
              pagination={false}
              size="middle"
              rowKey={"id"}
              // bordered
              className={classes.documentTable}
              // rowClassName={rowClassName}
              onRow={(record) => ({
                onMouseEnter: () => handleMouseEnter(record),
                onMouseLeave: handleMouseLeave,
              })}
            />
          </div>
        ) : (
          <>
            <div className={classes.emptyTableImg}>
              <img
                src={EmptyTableImg}
                alt="No Data"
                height="400px"
                width="300px"
              />
            </div>
            <Typography align="center" className={classes.emptyDataText}>
              Let’s begin by adding an Audit Type
            </Typography>
          </>
        )}
      </>

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
      )} */}
    </>
  );
};

export default AgendaModal;
