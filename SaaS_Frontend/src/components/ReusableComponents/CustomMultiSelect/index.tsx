import { Select, Avatar, Spin } from "antd";
import { makeStyles } from "@material-ui/core";
import { AiFillCheckCircle } from "react-icons/ai";

const { Option } = Select;

const useStyles = makeStyles({
  customSelect: {
    "& .ant-select-item-option-state": {
      display: "none !important",
    },
    "& .ant-select-item-option-selected:not(.ant-select-item-option-disabled)":
      {
        backgroundColor: "#e6f7ff",
      },
  },
});

type OptionType = {
  label: string;
  value: string;
  firstname: string;
  lastname: string;
  email: string;
  entityName: string;
  avatar?: string;
  assignedRoles?: { roleName: string }[];
  disable?: boolean;
};

type Props = {
  label: any;
  placeholder: string;
  options?: OptionType[];
  selectedValues: string[];
  onChange?: (values: string[]) => void;
  maxTagCount?: number;
  onSearch?: (value: string) => void;
  fetching?: boolean;
  disabled?: boolean;
  showRole?: boolean;
};

const CustomMultiSelect = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  maxTagCount = 3,
  onSearch,
  fetching = false,
  disabled = false,
  showRole = false,
}: Props) => {
  const classes = useStyles();

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  const formatName = (opt: OptionType) => {
    const base = `${opt.firstname} ${opt.lastname}`;
    if (showRole && opt.assignedRoles && opt.assignedRoles.length > 0) {
      return `${base} – ${opt.assignedRoles[0].roleName}`;
    }
    return base;
  };

  const tagRender = (props: any) => {
    const { value, closable, onClose } = props;
    const selectedOption = options?.find((opt) => opt.value === value);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#f5f5f5",
          borderRadius: "15px",
          padding: "2px 8px",
          margin: "3px",
        }}
      >
        <Avatar
          src={selectedOption?.avatar || undefined}
          style={{
            backgroundColor: "#7265e6",
            marginRight: "6px",
            fontSize: "13px",
            padding: "3px",
            width: "24px",
            height: "23px",
            lineHeight: "18px",
          }}
          size="small"
        >
          {!selectedOption?.avatar &&
            getInitials(
              `${selectedOption?.firstname ?? ""} ${
                selectedOption?.lastname ?? ""
              }`
            )}
        </Avatar>
        <span style={{ marginRight: 6, fontSize: "12px" }}>
          {`${selectedOption?.firstname ?? ""} ${
            selectedOption?.lastname ?? ""
          }`}
        </span>
        {closable && (
          <span
            style={{
              cursor: "pointer",
              marginLeft: 8,
              fontSize: 18,
              fontWeight: "bold",
              color: "black",
              display: "flex",
              alignItems: "center",
            }}
            onClick={onClose}
          >
            ×
          </span>
        )}
      </div>
    );
  };
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontWeight: 400, marginBottom: "2px" }}>{label}</div>
      <Select
        mode="multiple"
        placeholder={placeholder}
        disabled={disabled}
        className={classes.customSelect}
        style={{ width: "100%" }}
        size="large"
        optionLabelProp="label"
        tagRender={tagRender}
        value={selectedValues}
        onChange={onChange}
        showSearch
        filterOption={(input, option) =>
          (option?.label as string).toLowerCase().includes(input.toLowerCase())
        }
        notFoundContent={fetching ? <Spin size="small" /> : "No results found"}
        maxTagCount={maxTagCount}
        getPopupContainer={(triggerNode) =>
          triggerNode.parentNode as HTMLElement
        }
      >
        {options?.map((option) => (
          <Option
            key={option.value}
            value={option.value}
            label={formatName(option)} // <-- label with or without role
            className={classes.customSelect}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px 8px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={option.avatar}
                  style={{
                    backgroundColor: "#7265e6",
                    marginRight: "8px",
                    fontWeight: "bold",
                    width: 28,
                    height: 28,
                    fontSize: "12px",
                  }}
                >
                  {!option.avatar &&
                    getInitials(`${option.firstname} ${option.lastname}`)}
                </Avatar>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 400, fontSize: "14px" }}>
                    {formatName(option)}
                  </span>
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    {option.email}
                  </span>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "10px",
                    padding: "2px 10px",
                    fontSize: "12px",
                    color: "#555",
                    backgroundColor: "#fff",
                  }}
                >
                  {option.entityName}
                </div>
                {selectedValues?.includes(option?.value) && (
                  <AiFillCheckCircle
                    style={{ color: "#52c41a", fontSize: "20px" }}
                  />
                )}
              </div>
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default CustomMultiSelect;
