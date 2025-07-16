import {
  Popover,
  Form,
  Button,
  Select,
  Tooltip,
  Badge,
  Breadcrumb,
} from "antd";
import { AiTwotoneFilter } from "react-icons/ai";
import useStyles from "./styles"; // Assuming you're using the same styling logic
import { MdRotateLeft } from 'react-icons/md';
import { useEffect } from "react";
import getSessionStorage from "utils/getSessionStorage";
type PopoverFilterProps = {
  filterModal: any;
  setFilterModal: any;
  formData: any;
  setFormData: any;
  filterForm: any;
  handleCancel: any;
  handleOk: any;
  selectedLocation?: any;
  selectedEntity?: any;
  locationOptions?: any;
  departmentOptions?: any;
  handleLocationChange?: any;
  handleDepartmentChange?: any;
  badgeCount?: any;
  handleResetFilters?: any;
};

const DashboardFilterPopover = ({
  filterModal,
  setFilterModal,
  handleCancel,
  handleOk,
  selectedLocation,
  selectedEntity,
  locationOptions,
  departmentOptions,
  handleLocationChange,
  handleDepartmentChange,
  formData,
  setFormData,
  filterForm,
  badgeCount,
  handleResetFilters,
}: PopoverFilterProps) => {
  const classes = useStyles();
  const userDetails = getSessionStorage();
  useEffect(() => {
    console.log(
      "checkfilter locaiton de[art",
      selectedLocation,
      selectedEntity
    );
    console.log(
      "checkfilter location options",
      locationOptions,
      departmentOptions
    );
    console.log("checkfilter formdata", formData);
    console.log("checkfilter filterform", filterForm);
  }, [filterModal?.open, formData]);
  // Function to toggle the popover visibility
  const togglePopover = () => {
    setFilterModal({ ...filterModal, open: !filterModal.open });
  };
  const content = (
    <Form
      layout="vertical"
      style={{ width: "340px" }}
      onValuesChange={(changedValues, allValues) => {
        // console.log("checkrisk changed values", changedValues);
        console.log("checkrisk all values", allValues);
        console.log("checkrisk onchange hiraheader form called", changedValues);

        setFormData({
          ...formData,
          ...changedValues,
        });
      }}
      form={filterForm}
      initialValues={{
        locationId: userDetails?.location?.id,
        entityId: userDetails?.entity?.id,
      }}
    >
      {/* {JSON.stringify(formData)} */}

      <Form.Item label="Corp Func/Unit" name="unit">
        <Select
          // mode="multiple"
          showSearch
          allowClear
          placeholder="Select Corp Func/Unit"
          value={selectedLocation}
          className={classes.container}
          onChange={handleLocationChange}
          optionFilterProp="children"
          filterOption={(input: any, option: any) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {locationOptions.map((option: any) => (
            <Select.Option key={option.value} value={option.value}>
              <Tooltip title={option.label} placement="right">
                <div
                  style={{
                    maxWidth: "300px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.label}
                </div>
              </Tooltip>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Dept/Vertical" name="entity">
        <Select
          // mode="multiple"
          showSearch
          allowClear
          placeholder="Select Dept/Vertical"
          value={selectedEntity}
          className={classes.container}
          onChange={handleDepartmentChange}
          optionFilterProp="children"
          filterOption={(input: any, option: any) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {departmentOptions.map((option: any) => (
            <Select.Option key={option.value} value={option.value}>
              <Tooltip title={option.label} placement="right">
                <div
                  style={{
                    maxWidth: "300px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.label}
                </div>
              </Tooltip>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            type="primary"
            onClick={handleOk}
            style={{
              width: "calc(50% - 5px)",
              backgroundColor: "rgb(0, 48, 89)",
            }}
          >
            Apply
          </Button>
          <Button
            onClick={handleResetFilters}
            style={{
              width: "calc(50% - 5px)",
              display: "flex",
              justifyContent: "center",
            }}
            icon={<MdRotateLeft />}
          >
            Reset
          </Button>
        </div>
      </Form.Item>
    </Form>
  );

  const contentNew = (
    <Breadcrumb separator="  ">
      <Breadcrumb.Item>
        <span>Unit:</span>
        <Select
          showSearch
          allowClear
          placeholder="Select Unit"
          value={selectedLocation}
          style={{ width: 200, marginLeft: 8 }}
          onChange={handleLocationChange}
          optionFilterProp="children"
          filterOption={(input: any, option: any) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {locationOptions.map((option: any) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <span>Department:</span>
        <Select
          showSearch
          allowClear
          placeholder="Select Department"
          value={selectedEntity}
          style={{ width: 200, marginLeft: 8 }}
          onChange={handleDepartmentChange}
          optionFilterProp="children"
          filterOption={(input: any, option: any) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {departmentOptions.map((option: any) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <Popover
      content={contentNew}
      title="Filter By"
      trigger="click"
      open={filterModal?.open}
      onOpenChange={togglePopover}
      placement="bottom"
    >
      <div
        style={{
          cursor: "pointer",
          position: "absolute",
          top: "10px",
          right: "35px",
          fontSize: "20px",
        }}
      >
        <Badge
          count={badgeCount}
          style={{
            minWidth: "14px",
            height: "15px",
            fontSize: "10px",
            lineHeight: "16px",
          }}
        >
          <Button
            type="text"
            className={classes.filterButton}
            icon={
              <AiTwotoneFilter
                width={25}
                height={21}
                //   style={{width : "25px", height : "21px"}}
              />
            }
          />
        </Badge>
      </div>
    </Popover>
  );
};

export default DashboardFilterPopover;
