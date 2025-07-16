import React, { useState, useEffect } from "react";
import { Button, Layout, Space, Tabs } from "antd";
import { ReactComponent as ShrinkIcon } from "../../assets/icons/shrink-new.svg";
import { useNavigate } from "react-router-dom";
import { Theme, Tooltip, makeStyles } from "@material-ui/core";
import { useLocation } from "react-router";
import { useSnackbar } from 'notistack';
import { useMediaQuery } from '@material-ui/core';
import axios from "../../apis/axios.global";
import moment from 'moment';
import { useParams } from "react-router-dom";
import checkRoles from "../../utils/checkRoles";
import CaraRegistration from "components/CaraRegistration";

const { Content, Header } = Layout;

const useStyles = makeStyles((theme: Theme) => ({
    tabsWrapper: {
        "& .ant-tabs-tab": {
            backgroundColor: "#ADD8E6 !important",
            color: "black !important",
        },
        "& .ant-tabs-tab-active": {
            backgroundColor: "skyblue !important",
        },
        "& .ant-tabs-tab-active div": {
            color: "white !important",
            fontWeight: "500",
        },
    },
}));
const CaraDetails = (props: any) => {
    const location: any = useLocation();
    const isOrgAdmin = checkRoles("ORG-ADMIN");
    const isMR = checkRoles("MR");
  
    const showData = isOrgAdmin || isMR;
    const params = useParams();
 
    const [formData, setFormData] = useState(location?.state?.formData || {});
    const navigate = useNavigate();
    const orgId = sessionStorage.getItem("orgId");
    const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();
    const isSmallScreen = useMediaQuery('(max-width:600px)');

    const tabs = [
        {
            label: 'CARA Registration',
            key: 1,
            children: <CaraRegistration formData={formData} setFormData={setFormData} />,
        },
        {
            label: 'Why Why Analysis',
            key: 2,
            children: (
                <div></div>
            ),
            disabled:formData?.status!=="ACCEPTED"
        },
        {
          label: 'Outcome Action',
          key: 3,
          children: (
              <div></div>
          ),
          disabled:formData?.status!=="ACCEPTED"
      },
       
    ];

    useEffect(() => {
        if (params && params.id && params.id.length) {
            getMRMValues()
        }
    }, []);


    const getMRMValues = async () => {
        const res = await axios(`/api/mrm/getMrmMeetingDetails/${params?.id}`);
        if (res.status === 200 || res.status === 201) {
            const data = res.data && res.data[0];
            setFormData({
                organizer: data?.userName, unit: data?.value?.unitId, system: data?.value?.systemId, meetingTitle: data?.value?.meetingName, period: data?.value?.period, meetingDescription: data?.value?.description, dataValue: data?.value?.keyAgendaId, attendees: data?.value?.attendees, allData: data, date: data?.value?.meetingdate, _id: data?.value?._id, meetingMOM: data?.value?.notes
            })
        }
    }

    const goBack = () => {

        if (location?.state?.mrm) {
            console.log(formData,"formData inside details")
            navigate("/cara", {
                state: { drawer: true, dataValues: formData },
            });
        } else if (params && params.id && params.id.length) {
            navigate("/mrm/mrm", {
                state: { drawerOpen: true, dataValues: formData },
            });
        } else {
            navigate("/mrm/calendar", {
                state: { drawerOpen: true, dataValues: formData },
            });

        }

    };

    const handleSubmit = async () => {

  
        if(showData){

            const agendaValues: any = [];
    
            const decisionValue = formData?.decisionPoints && formData?.decisionPoints.length ? formData?.decisionPoints : [];
    
            if (formData?.dataValue && formData?.dataValue.length) {
    
                for (let i = 0; i < formData?.dataValue.length; i++) {
                    const newValue = formData?.dataValue[i];
    
    
                    agendaValues.push({
                        agenda: newValue?.agenda,
                        keyagendaId: newValue?.keyagendaId,
                        owner: newValue?.owner,
                        decisionPoints: decisionValue
                    })
    
                }
            }
    
    
            if (formData && formData?._id) {
                const newPayload = {
                    organizationId: orgId,
                    momPlanYear: '2023',
                    unitId: formData?.unit,
                    systemId: formData?.system ? formData?.system : formData?.allValues?.system ? formData?.allValues?.system : [],
                    period: formData?.period,
                    meetingName: formData?.meetingTitle,
                    meetingdate: formData?.changedValues && formData?.changedValues?.date ? moment(formData?.changedValues?.date) : moment(formData?.date),
                    keyAgendaId: agendaValues,
                    attendees: formData?.attendees,
                    // organizer: userDetail && userDetail?.id,
                    description: formData?.meetingDescription,
                    decision: decisionValue,
                    notes: formData?.meetingMOM,
                    updatedBy: userDetail && userDetail?.id,
                    files: formData?.file || []
                    // createdBy: userDetail && userDetail?.id
                };
                // update api
                const res = await axios.patch(`/api/mrm/${formData?._id}`, newPayload);
    
                if (res.status === 200 || res.status === 201) {
                    enqueueSnackbar(`Data updated Successfully!`, {
                        variant: "success",
                    });
                }
            } else {
    
                const newPayload = {
                    organizationId: orgId,
                    momPlanYear: '2023',
                    unitId: formData?.unit,
                    systemId: formData?.system,
                    period: formData?.period,
                    meetingName: formData?.meetingTitle,
                    meetingdate: formData?.changedValues && formData?.changedValues?.date ? moment(formData?.changedValues?.date) : moment(formData?.date),
                    keyAgendaId: agendaValues,
                    attendees: formData?.attendees,
                    organizer: userDetail && userDetail?.id,
                    description: formData?.meetingDescription,
                    decision: decisionValue,
                    notes: formData?.meetingMOM,
                    updatedBy: userDetail && userDetail?.id,
                    createdBy: userDetail && userDetail?.id,
                    files: formData?.file || []
    
                };
    
                const res = await axios.post("/api/mrm/schedule", newPayload);
                if (res.status === 200 || res.status === 201) {
                    enqueueSnackbar(`Data Added successfully!`, {
                        variant: "success",
                    });
                }
            }
        }


        if ((location?.state?.mrm) || (params && params.id && params.id.length)) {
            navigate("/mrm/mrm");
        } else {
            navigate("/mrm/calendar");
        }
    };

    return (
        <Layout style={{ background: "aliceblue" }}>
            <Header style={{ backgroundColor: "#fff", padding: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                        <Tooltip title="Shrink Form">
                            <Button
                                // type="primary"
                                onClick={goBack}
                            // style={{ marginRight: "16px" }}
                            >
                                <ShrinkIcon
                                    style={{
                                        width: "1em",
                                        height: "1em",
                                        fill: "black",
                                        verticalAlign: "middle",
                                        overflow: "hidden",
                                    }}
                                />
                                {/* <ArrowBackIcon /> */}
                            </Button>
                        </Tooltip>
                    </div>
                    <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                        // onClick={handleCloseModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            type="primary"
                        >
                            Submit
                        </Button>
                    </Space>
                </div>
            </Header>
            <Content style={{ margin: "24px 16px 0" }}>
                <div
                    style={{
                        padding: 24,
                        backgroundColor: "#fff",
                    }}
                >
                    <div className={classes.tabsWrapper}>
                        <Tabs
                            type="card"
                            items={tabs as any}
                            animated={{ inkBar: true, tabPane: true }}
                        />
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default CaraDetails;
