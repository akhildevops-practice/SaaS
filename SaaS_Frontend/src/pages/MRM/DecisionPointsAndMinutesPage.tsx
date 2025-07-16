import React, { useEffect, useState } from 'react';
import { Form, Input, Row, Col,  Button, Spin } from "antd";
import getAppUrl from "../../utils/getAppUrl";
import { useSnackbar } from "notistack";
import MyEditor from "./Editor";
import { makeStyles, Collapse } from "@material-ui/core";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { AiOutlineMinusCircle } from "react-icons/ai";
import ArrowDropDown from '../../assets/TeamDropdown.svg';
import checkRoles from "../../utils/checkRoles";

const { TextArea } = Input;


type Props = {
    formData?: any;
    setFormData?: any;
};


const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        "& .MuiAccordionDetails-root": {
            display: "block",
        },
    },
    uploadSection: {
        "& .ant-upload-list-item-name": {
            color: "blue !important",
        },
    },
    divAction: {
        display: 'flex',
        alignItems: 'center',
        margin: '20px 0',
    },

    line: {
        width: '49%',
        height: '1px',
        backgroundColor: '#cacaca',

    },
    last: {
        margin: '0 auto',
    },
    arrow: {
        backgroundImage: `url(${ArrowDropDown})`,
        height: '10px',
        width: '10px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '100%',
        margin: '0 10px',
        cursor: 'pointer',
        rotate: '180deg'
    },
    active: {
        rotate: '0deg'
    }

}));

const DecisionPointsAndMinutesPage = ({
    formData,
    setFormData,
}: Props) => {
    const isOrgAdmin = checkRoles("ORG-ADMIN");
    const isMR = checkRoles("MR");
  
    const showData = isOrgAdmin || isMR;
    const [firstForm] = Form.useForm();
    const [dataSource, setDataSource] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [collapseDiv, setCollapseDiv] = useState(true);
    const [documentForm] = Form.useForm();
    const classes = useStyles();


    const orgId = sessionStorage.getItem("orgId");
    const realmName = getAppUrl();
    const { enqueueSnackbar } = useSnackbar();


    useEffect(() => {
        setLoading(true);
        const newData = { ...formData };


        let newDataSource: any = [];

        const datavalues = newData?.dataValue ? newData.dataValue : newData?.keyadendaDataValues ? newData.keyadendaDataValues : []
        if (datavalues && datavalues.length) {
            newDataSource = datavalues[0] && datavalues[0]?.decisionPoints
        }

        setDataSource(newDataSource)
        setLoading(false)
        setFormData({ ...formData, decisionPoints: newDataSource })
    }, [])


 
    const onFinish = (values: any) => {
        console.log('Received values of form:', values);
    };

    const toggleDiv = () => {
        setCollapseDiv(!collapseDiv)
    };

    const addData = () => {
        const newSource: any = [...dataSource];
        newSource.push({
            decisionPoints: ''
        });

        setDataSource(newSource)
    }



    const removeData = (index: number) => {
        const newDatasource = [...dataSource];
        if (index > -1) { // only splice array when item is found
            newDatasource.splice(index, 1); // 2nd parameter means remove one item only
            setDataSource(newDatasource)
        }
    }


    const handleDecisionPoints = (value: any, key: number) => {
        const newDatasource = [...dataSource];
        newDatasource[key].decisionPoints = value;

        setDataSource(newDatasource);
        setFormData({ ...formData, decisionPoints: newDatasource });
    }

    return (
        <> {
            loading ? (
                <Spin style={{ display: 'flex', justifyContent: 'center' }}> </Spin>
            ) : (

                <Form
                    form={firstForm}
                    layout="vertical"
                    // onValuesChange={(changedValues, allValues) => setFormData({ ...formData, points : allValues,  changedValues })}
                    autoComplete="off"
                    onFinish={onFinish}
                    initialValues={dataSource}
                >
                    <div className={classes.divAction}>
                        <div className={classes.line} />
                        <div className={`${classes.arrow} ${collapseDiv && classes.active}`} onClick={toggleDiv} />
                        <div className={`${classes.line} ${classes.last}`} />
                    </div>
                    <Collapse in={collapseDiv}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.List name="points"
                                    initialValue={dataSource}
                                >
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <>

                                                    <Row gutter={[16, 16]}>
                                                        <Col span={20}>
                                                            <Form.Item
                                                                {...restField}
                                                                label='Decision Points'
                                                                name={[name, 'decisionPoints']}
                                                                rules={[{ required: true, message: 'Enter decision points' }]}
                                                            >

                                                                <TextArea disabled={showData ? false : true} autoSize={{ minRows: 2 }} onBlur={(e) => handleDecisionPoints(e.target.value, key)} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={4}>
                                                            <AiOutlineMinusCircle style={{ marginTop: '40%' }} onClick={() => { remove(name); removeData(name) }} />
                                                        </Col>
                                                    </Row>
                                                </>
                                            ))}
                                            <Form.Item>
                                                <Button type="dashed" onClick={() => { add(); addData() }} block icon={<AiOutlinePlusCircle />}>
                                                    Add Decision Point
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Col>
                        </Row>
                    </Collapse>



                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item label="Meeting Minutes">
                                <MyEditor formData={formData} setFormData={setFormData} title="mom" readStatus={undefined} readMode={undefined} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

            )
        }
        </>
    )
}

export default DecisionPointsAndMinutesPage;