//react, react-router, recoil
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { drawerData, processDocFormData } from "recoil/atom";

//material-ui
import { Menu, MenuItem } from "@material-ui/core";
import { MdOutlineExpandMore } from 'react-icons/md';
import { Theme, makeStyles, Tooltip } from "@material-ui/core";

//antd
import { Tabs, Layout, Space, Button } from "antd";

//assets
import { ReactComponent as ShrinkIcon } from "assets/icons/shrink-new.svg";

//components
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import DocDetailsTab from "components/Document/CommonDrawerComponents/DocDetailsTab";
import WorkFlowTab from "components/Document/CommonDrawerComponents/WorkflowTab";

type Props = {
  drawer: any;
  setDrawer: any;
  activeTabKey: any;
  onTabsChange: any;
  handleDocFormCreated: any;
  uploadFileError: any;
  setUploadFileError: any;
  disableFormFields: any;
  workFlowForm: any;
  setWorkFlowForm: any;
  handleWorkFlowFormCreated: any;
  // isWorkflowValid: any;
  // setIsWorkflowValid: any;
  selectedReviewerFormData: any;
  setSelectedReviewerFormData: any;
  selectedApproverFormData: any;
  setSelectedApproverFormData: any;
  handleSubmit: any;
  items: any;
  onMenuClick: any;
  isUserInApprovers: any;
};
const { Content, Header } = Layout;
const useStyles = makeStyles((theme: Theme) => ({
  actionHeader: {
    "& .ant-btn-default": {
      backgroundColor: "#e8f3f9",
      borderColor: "#0e497a",
      "& svg": {
        color: "#0e497a",
      },
    },
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  fullformtabs: {
    margin: "24px 16px 0",
    [theme.breakpoints.up("lg")]: {
      height: "70vh", // Adjust the max-height value as needed for large screens
      overflowY: "auto",
    },
    [theme.breakpoints.up("xl")]: {
      height: "80vh",
      overflowY: "auto",
    },
  },
}));

const ExpandedDrawerView = ({
  drawer,
  setDrawer,
  activeTabKey,
  onTabsChange,
  handleDocFormCreated,
  uploadFileError,
  setUploadFileError,
  disableFormFields,
  workFlowForm,
  setWorkFlowForm,
  handleWorkFlowFormCreated,
  // isWorkflowValid,
  // setIsWorkflowValid,
  selectedReviewerFormData,
  setSelectedReviewerFormData,
  selectedApproverFormData,
  setSelectedApproverFormData,
  handleSubmit,
  items,
  onMenuClick,
  isUserInApprovers,
}: Props) => {
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const [formData, setFormData] = useRecoilState(processDocFormData);
  const [disableFields, setDisableFields] = useState<any>(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");

  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const classes = useStyles();
  const navigate = useNavigate();
  const [aceoffixEdit, setAceoffixEdit] = useState(false);

  useEffect(() => {

    setDisableFields(isUserInApprovers(loggedInUser, formData?.approvers));
  }, []);

  const goBack = () => {
    if (drawerDataState?.formMode === "edit") {
      navigate("/processdocuments/processdocument", {
        state: { drawerOpenEditMode: true },
      });
    } else if (drawerDataState?.formMode === "create") {
      navigate("/processdocuments/processdocument", {
        state: { drawerOpenAddMode: true },
      });
    }
  };
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const tabs = [
    {
      label: "Doc Info",
      key: 1,
      children: (
        <DocDetailsTab
          drawer={drawer}
          setDrawer={setDrawer}
          handleDocFormCreated={handleDocFormCreated}
          uploadFileError={uploadFileError}
          setUploadFileError={setUploadFileError}
          disableFormFields={disableFields}
          disableDocType={drawerDataState.id ? true : false}
        />
      ),
    },
    {
      label: "Workflow",
      key: 2,
      children: (
        <WorkFlowTab
          drawer={drawer}
          setDrawer={setDrawer}
          handleDocFormCreated={handleDocFormCreated}
          workFlowForm={workFlowForm}
          setWorkFlowForm={setWorkFlowForm}
          handleWorkFlowFormCreated={handleWorkFlowFormCreated}
          // isWorkflowValid={isWorkflowValid}
          // setIsWorkflowValid={setIsWorkflowValid}
          disableFormFields={disableFields}
          selectedReviewerFormData={selectedReviewerFormData}
          setSelectedReviewerFormData={setSelectedReviewerFormData}
          selectedApproverFormData={selectedApproverFormData}
          setSelectedApproverFormData={setSelectedApproverFormData}
        />
      ),
    },
    {
      label: "References",
      key: 3,
      children: <CommonReferencesTab drawerDataState={drawerDataState} />,
    },
  ];

  const inlineEdit = async () => {}

  return (
    <>
      <Layout style={{ background: "aliceblue" }}>
        <Header style={{ backgroundColor: "#fff", padding: 0 }}>
          <div
            style={{ display: "flex", justifyContent: "space-between" }}
            className={classes.actionHeader}
          >
            <div>
              <Tooltip title="Shrink Form">
                <Button onClick={goBack}>
                  <ShrinkIcon
                    style={{
                      width: "1em",
                      height: "1em",
                      fill: "black",
                      verticalAlign: "middle",
                      overflow: "hidden",
                    }}
                  />
                </Button>
              </Tooltip>
            </div>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              {/* <Button>Cancel</Button> */}
              {/* <Dropdown
                menu={{ items: drawerDataState?.items, onClick: onMenuClick }}
              >
                <Button style={{ display: "flex", alignItems: "center" }}>
                  <span>Actions</span>

                  <MdOutlineExpandMore />
                </Button>
              </Dropdown> */}
              <Button
                onClick={handleClick}
                style={{ display: "flex", alignItems: "center" }}
                disabled={drawerDataState?.items?.length === 0}
              >
                <span style={{ fontWeight: "bold" }}>
                  {selectedItem || "Actions"}
                </span>
                <MdOutlineExpandMore
                  style={{
                    fill: `${
                      drawerDataState?.items?.length === 0 ? "gray" : "#0e497a"
                    }`,
                  }}
                />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {drawerDataState?.items &&
                  drawerDataState?.items.length > 0 &&
                  drawerDataState?.items?.map((item: any, index: any) => (
                    <MenuItem
                      key={index + 1}
                      onClick={() => {
                        if(item === "Inline Edit"){
                          inlineEdit()
                        }else{
                        onMenuClick(item)
                      }}}
                      disabled={item === "In Approval" || item === "In Review"}
                    >
                      {item}
                    </MenuItem>
                  ))}
              </Menu>
            </Space>
          </div>
        </Header>
        <Content className={classes.fullformtabs}>
          <div
            style={{
              padding: 24,
              minHeight: 280,
              backgroundColor: "#fff",
            }}
          >
            <div className={classes.tabsWrapper}>
              <Tabs
                defaultActiveKey="1"
                onChange={(key) => {
                  onTabsChange(key);
                }}
                activeKey={activeTabKey}
                type="card"
                items={tabs as any}
                animated={{ inkBar: true, tabPane: true }}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default ExpandedDrawerView;
