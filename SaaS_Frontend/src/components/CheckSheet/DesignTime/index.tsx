import { Component, useEffect, useRef, useState } from "react";
import {
  Button as AntButton,
  Input,
  InputNumber,
  Table,
  Button,
  Modal,
  Tooltip,
  Select,
  Dropdown,
  Menu,
  Checkbox,
  Form,
  DatePicker,
  Space,
  Tag,
  Upload,
  Popover,
} from "antd";
import axios from "apis/axios.global";
import Papa from "papaparse";

import {
  AiOutlinePlusCircle,
  AiOutlineDelete,
  AiOutlineDownCircle,
  AiOutlineCheckCircle,
  AiOutlineRetweet,
  AiOutlineEdit,
} from "react-icons/ai";

import ChecklistInformationModal from "../ChecklistInformationModal";
import { useNavigate, useParams } from "react-router-dom";
import useStyles from "./style";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@material-ui/core";
import { MdDelete, MdExpandMore } from "react-icons/md";
import DataTypeforTableCells from "../DataTypeforTableCells";
import { v4 as uuidv4 } from "uuid";
import {
  RiDeleteBin2Fill,
  RiDeleteBin4Fill,
  RiDeleteBin5Fill,
  RiFileCopy2Fill,
} from "react-icons/ri";

import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaPlus,
  FaPlusSquare,
} from "react-icons/fa";
import { IoMdMenu, IoMdMore } from "react-icons/io";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

type RowFieldType = "label" | "specification" | "value" | "remarks";
interface TableHeader {
  id: string;
  type: string;
  attributeName: string;
  rowFieldType: RowFieldType;
}

//-----------free flow -from--------------

import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  NumberOutlined,
  DownSquareOutlined,
  CheckSquareOutlined,
  CheckOutlined,
  CloseOutlined,
  LeftOutlined,
  PlusOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { CgSpaceBetweenV } from "react-icons/cg";

const DesignTime = () => {
  const classes = useStyles();
  const { urlId } = useParams<{ urlId: any }>();
  const navigate = useNavigate();
  const { confirm } = Modal;

  const [formData, setFormData] = useState<any>({});
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<any[]>([]);
  const [title, setTitle] = useState();
  const [inputs, setInputs] = useState<any[]>([]);
  //const [inputCount, setInputCount] = useState(0);
  const [showModal, setShowModal] = useState<any>({});
  const [finalData, setFinalData] = useState<any[]>([]);
  //const [numberofColumnsForTable, setNumberofColumnsForTable] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempColumn, setTempColumn] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [expanded1, setExpanded1] = useState(true);
  const [visibleIndices, setVisibleIndices] = useState<any>({});
  const [selectedField, setSelectedField] = useState<any>("");
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [selectedFieldToleranceType, setSelectedFieldToleranceType] =
    useState("none");
  const [selectedFieldToleranceValue, setSelectedFieldToleranceValue] =
    useState(0);
  const [newOption, setNewOption] = useState("");
  const [modalClose, setModalClose] = useState(false);
  const [clickedCell, setClickedCell] = useState({
    rowIndex: null,
    value: "",
    index: null,
    columnType: "",
    tableId: "",
    cellId: "",
  });
  const [selectedCellDatatypes, setSelectedCellDatatypes] =
    useState<any>(clickedCell);
  const [showCustomMultiValueInput, setShowCustomMultiValueInput] =
    useState(false);
  const [workflowList, setWorkflowList] = useState<any>();
  const [workflowDetails, setWorkflowDetails] = useState<any>();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const bottomRef = useRef<HTMLDivElement>(null);
  //----------merge cells ------------------------

  const [selectedCells, setSelectedCells] = useState<{
    [cellId: string]: boolean;
  }>({});
  const [mergeEnabled, setMergeEnabled] = useState(true);

  const [popoverVisible, setPopoverVisible] = useState(false);

  //-------Data types for section-------------
  const [selectedField2, setSelectedField2] = useState("");
  const [selectedFormula2, setSelectedFormula2] = useState("");
  const [appFields, setAppFields] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [selectedValues2, setSelectedValues2] = useState<{
    datatype: string;
    dataOptions: any;
  }>({
    datatype: "",
    dataOptions: "",
  });
  const [customFontSize, setCustomFontSize] = useState<number | null>(null);
  const [customTextAlign, setCustomTextAlign] = useState<string>("start");
  const [customFontWeight, setCustomFontWeight] = useState<string>("normal");

  //----------consoles----------------
  // console.log("visibleIndices", visibleIndices);
  // console.log("selectedId22", selectedId);
  // console.log("formData", formData);
  // console.log("finalData", finalData);
  // console.log("selectedValues66", selectedValues);
  // console.log("inputs", inputs);
  // console.log("newDataSource", newDataSource);
  // console.log("selectedId", selectedId);
  // console.log("clickedCell", clickedCell);
  // console.log("visibleIndices", visibleIndices);
  // console.log("tempColumn", tempColumn);
  // console.log("selectedCellDatatypes", selectedCellDatatypes);
  // console.log("selectedField", selectedField);
  // console.log("workflowList", workflowList);
  // console.log("selectedCells", selectedCells);

  //---------useeffects-------------------

  useEffect(() => {
    if (selectedCellDatatypes) {
      const updatedFormData = {
        ...formData,
        tableFields: formData?.tableFields?.map((table: any) => {
          if (table.tableId === selectedCellDatatypes.tableId) {
            return {
              ...table,
              tableContent: table.tableContent.map((row: any, rowIdx: any) => {
                if (rowIdx === selectedCellDatatypes.rowIndex) {
                  return {
                    ...row,
                    cells: row.cells.map((cell: any, cellIdx: any) => {
                      if (cell.id === selectedCellDatatypes.cellId) {
                        return {
                          ...cell,
                          datatype: selectedCellDatatypes.dataType,
                          dataOptions: selectedCellDatatypes.dataOptions,
                          toleranceType: selectedCellDatatypes.toleranceType,
                          toleranceValue: selectedCellDatatypes.toleranceValue,
                        };
                      }
                      return cell;
                    }),
                  };
                }
                return row;
              }),
            };
          }
          return table;
        }),
      };

      setFormData(updatedFormData);
    }
  }, [selectedCellDatatypes]);

  // copy and paste data to the table function
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const pastedData = event.clipboardData?.getData("Text");

      if (pastedData && selectedTableId) {
        Papa.parse(pastedData, {
          complete: (result) => {
            const parsedData = result.data;

            const selectedTableIndex = formData.tableFields.findIndex(
              (tableObj: any) => tableObj.tableId === selectedTableId
            );

            if (selectedTableIndex === -1) return;

            const selectedTable = formData.tableFields[selectedTableIndex];

            // Find the dynamic key that holds the header array (like tableHeader2, etc.)
            const headerKey = Object.keys(selectedTable).find((key) => {
              const value = selectedTable[key];
              return (
                Array.isArray(value) &&
                value.every(
                  (item: any) =>
                    item.attributeName && item.rowFieldType && item.id
                )
              );
            });

            if (!headerKey) return;

            const tableHeader = selectedTable[headerKey];

            const newData = parsedData?.map((row: any, rowIndex: number) => {
              const cells = tableHeader?.map(
                (header: any, colIndex: number) => ({
                  id: uuidv4(),
                  tableId: selectedTable.tableId,
                  tableHeaderId: header.id,
                  columnName: header.attributeName,
                  columnType: header.rowFieldType,
                  value: row[colIndex] || "",
                  datatype: "text",
                  dataOptions: "",
                })
              );

              return {
                row: rowIndex + 1,
                cells,
              };
            });

            const filteredData = newData.filter((row) =>
              row.cells.some((cell: any) => cell.value?.trim() !== "")
            );

            const updatedTables = [...formData.tableFields];
            updatedTables[selectedTableIndex] = {
              ...selectedTable,
              tableContent: [
                ...(selectedTable.tableContent || []),
                ...filteredData,
              ],
            };

            setFormData({
              ...formData,
              tableFields: updatedTables,
            });
          },
        });
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [formData, selectedTableId]);

  // Reset the values whenever clickedCell changes
  useEffect(() => {
    setSelectedCellDatatypes({
      ...clickedCell,
      dataType: selectedField,
      dataOptions: selectedFormula,
      toleranceType: selectedFieldToleranceType,
      toleranceValue: selectedFieldToleranceValue,
    });
    // setSelectedCellDatatypes(clickedCell);
  }, [clickedCell]);

  // storing formId to the state
  useEffect(() => {
    if (urlId) {
      setSelectedId(urlId);
    }
  }, [urlId]);

  //calling table Data from the api
  useEffect(() => {
    if (selectedId) {
      getTableData();
    }
  }, [selectedId]);

  // Update formData when title changes
  useEffect(() => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      title,
    }));
  }, [title]);

  // Update formData when selectedValues change
  useEffect(() => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      formHeader: finalData,
    }));
  }, [finalData]);

  useEffect(() => {
    const mergedData = inputs.map((input, index) => ({
      id: selectedValues[index]?.id ? selectedValues[index]?.id : uuidv4(),
      attributeName: input,
      ...selectedValues[index],
    }));
    setFinalData(mergedData);
  }, [inputs, selectedValues]);

  useEffect(() => {
    getWorkflows();
    getData();
  }, []);

  useEffect(() => {
    setSelectedField2(selectedValues2.datatype);
    setSelectedFormula2(selectedValues2.dataOptions);
  }, [selectedValues2]);

  //---------------functions--------------------

  //-------Form title---------

  const handleChangeTitle = (value: any) => {
    setTitle(value);
  };

  //--------to select number of form headers----------
  // const handleSelectChange = (value: any) => {
  //   setInputCount(value);
  //   setInputs(Array.from({ length: value }, () => ""));
  // };

  const handleFormLayoutChange = (value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      formLayout: value,
    }));
  };

  //--------to add addtional form headers by cliking plus button----------
  const addInput = () => {
    setInputs([...inputs, ""]);
    //setInputCount(inputCount + 1);
  };

  //-------Delete perticular form header -------------
  const deleteInput = (index: any) => {
    const updatedInputs = inputs.filter((_, i) => i !== index);
    setInputs(updatedInputs);
    //setInputCount(inputCount - 1);
    const newSelectedValues = selectedValues.filter((_, i) => i !== index);
    setSelectedValues(newSelectedValues);
  };

  //-------to store form header input value---------------
  const handleInputChange = (index: any, value: any) => {
    const updatedInputs = [...inputs];
    updatedInputs[index] = value;
    setInputs(updatedInputs);
  };

  //----------to toggle the data type componenet show or hide -----------
  const toggleModal = (index: any) => {
    setShowModal((prevState: any) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  //-----------to add new row to the table------------------
  const addRow = (tableId: string) => {
    setFormData((prevData: any) => {
      const updatedTables = prevData.tableFields.map((tableFields: any) => {
        if (tableFields.tableId !== tableId) return tableFields;

        // Find the header key dynamically (e.g., 'tableHeader1', 'tableHeader2')
        const headerKey = Object.keys(tableFields).find(
          (key) =>
            key.startsWith("tableHeader") && Array.isArray(tableFields[key])
        );

        const headers = headerKey ? tableFields[headerKey] : [];

        // Generate new row index
        const newRowIndex = tableFields.tableContent.length + 1;

        const newRow = {
          row: newRowIndex,
          cells: headers.map((header: any) => ({
            id: uuidv4(),
            tableId: tableFields.tableId,
            tableHeaderId: header.id,
            columnName: header.attributeName,
            columnType: header.rowFieldType,
            value: "",
            datatype: "text",
            dataOptions: "",
          })),
        };

        return {
          ...tableFields,
          tableContent: [...tableFields.tableContent, newRow],
        };
      });

      return {
        ...prevData,
        tableFields: updatedTables,
      };
    });
  };

  const handleAddRow = (tableId: any, index: number) => {
    setFormData((prevData: any) => {
      const updatedTables = prevData.tableFields.map((tableFields: any) => {
        if (tableFields.tableId !== tableId) return tableFields;

        const headerKey = Object.keys(tableFields).find(
          (key) =>
            key.startsWith("tableHeader") && Array.isArray(tableFields[key])
        );

        const headers = headerKey ? tableFields[headerKey] : [];

        const newRow = {
          row: index + 2, // tentative row number (will be updated below)
          cells: headers.map((header: any) => ({
            id: uuidv4(),
            tableId: tableFields.tableId,
            tableHeaderId: header.id,
            columnName: header.attributeName,
            columnType: header.rowFieldType,
            value: "",
            datatype: "text",
            dataOptions: "",
          })),
        };

        const updatedTableContent = [...tableFields.tableContent];
        updatedTableContent.splice(index + 1, 0, newRow); // Insert below

        // Re-index all row numbers
        const reIndexedContent = updatedTableContent.map((row, idx) => ({
          ...row,
          row: idx + 1,
        }));

        return {
          ...tableFields,
          tableContent: reIndexedContent,
        };
      });

      return {
        ...prevData,
        tableFields: updatedTables,
      };
    });
  };

  const handleDeleteRow = (tableId: string, rowIndex: number) => {
    setFormData((prevFormData: any) => {
      const updatedTables = prevFormData.tableFields.map((tableFields: any) => {
        if (tableFields.tableId !== tableId) return tableFields; // Only update the matching tableFields

        const newTableContent = tableFields.tableContent.filter(
          (_: any, index: any) => index !== rowIndex
        );

        // Optional: Reassign correct row numbers after delete
        const reIndexedContent = newTableContent.map((row: any, idx: any) => ({
          ...row,
          row: idx + 1,
        }));

        return {
          ...tableFields,
          tableContent: reIndexedContent,
        };
      });

      return {
        ...prevFormData,
        tableFields: updatedTables,
      };
    });
  };

  const habdleDeleteAllConfirm = (tableId: any) => {
    confirm({
      title: "Are you Sure you want to Delete All the Table Data?",
      // content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        habdleDeleteAll(tableId);
      },
      onCancel() {},
    });
  };

  const habdleDeleteAll = (tableId: any) => {
    setFormData((prevFormData: any) => {
      const updatedTables = prevFormData.tableFields.map((tableFields: any) => {
        if (tableFields.tableId === tableId) {
          return {
            ...tableFields,
            tableContent: [], // Clear the tableContent
          };
        }
        return tableFields; // other tables remain unchanged
      });

      return {
        ...prevFormData,
        tableFields: updatedTables,
      };
    });
  };

  const habdleDeleteTableConfirm = (tableId: any) => {
    confirm({
      title: "Are you Sure you want to Delete All the Table Data?",
      // content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        habdleDeleteTable(tableId);
      },
      onCancel() {},
    });
  };

  const habdleDeleteTable = (tableIdToDelete: any) => {
    const updatedTableFields = formData.tableFields.filter(
      (table: any) => table.tableId !== tableIdToDelete
    );

    setFormData({
      ...formData,
      tableFields: updatedTableFields,
    });
  };

  const handleMoveRow = (
    tableId: string,
    rowIndex: number,
    direction: "up" | "down"
  ) => {
    setFormData((prevFormData: any) => {
      const updatedTables = prevFormData.tableFields.map((tableFields: any) => {
        if (tableFields.tableId !== tableId) return tableFields; // Only modify the matching tableId

        const tableContent = [...tableFields.tableContent];

        if (direction === "up" && rowIndex > 0) {
          // Swap current row with the row above
          [tableContent[rowIndex], tableContent[rowIndex - 1]] = [
            tableContent[rowIndex - 1],
            tableContent[rowIndex],
          ];
        } else if (direction === "down" && rowIndex < tableContent.length - 1) {
          // Swap current row with the row below
          [tableContent[rowIndex], tableContent[rowIndex + 1]] = [
            tableContent[rowIndex + 1],
            tableContent[rowIndex],
          ];
        }

        // After swapping, re-assign correct row numbers
        const reIndexedContent = tableContent.map((row, idx) => ({
          ...row,
          row: idx + 1, // Reset row number (optional, based on your need)
        }));

        return {
          ...tableFields,
          tableContent: reIndexedContent,
        };
      });

      return {
        ...prevFormData,
        tableFields: updatedTables,
      };
    });
  };

  //------to add new column for table -----------
  const addColumnsForTable = (tableId: string) => {
    const newColumn = {
      id: uuidv4(),
      type: "",
      attributeName: "",
      rowFieldType: "label",
    };

    setFormData((prevFormData: any) => ({
      ...prevFormData,
      tableFields: prevFormData.tableFields.map((tableItem: any) => {
        if (tableItem.tableId === tableId) {
          const key = Object.keys(tableItem).find((k) => k !== "tableId");
          return {
            ...tableItem,
            [key as string]: [...tableItem[key as string], newColumn],
          };
        }
        return tableItem;
      }),
    }));

    //setNumberofColumnsForTable((prev) => prev + 1);
  };

  //------to save new column for table -----------
  const saveColumnName = (
    index: any,
    newAttributeName: any,
    id: any,
    rowFieldType: any,
    tableId: any
  ) => {
    setFormData((prevFormData: any) => {
      const updatedTables = prevFormData.tableFields.map((tableObj: any) => {
        if (tableObj.tableId !== tableId) {
          return tableObj;
        }
        // Clone the object to avoid mutation
        const updatedTableObj = { ...tableObj };

        // Find the key that holds the array of columns (with attributeName and id)
        const headerKey = Object.keys(updatedTableObj).find((key) => {
          const value = updatedTableObj[key];
          return (
            Array.isArray(value) && value.some((item: any) => item.id === id)
          );
        });

        // If we find such key, update the matching column by id
        if (headerKey) {
          updatedTableObj[headerKey] = updatedTableObj[headerKey].map(
            (column: any) =>
              column.id === id
                ? { ...column, attributeName: newAttributeName }
                : column
          );
        }

        // 👉 After updating the header, now add the new cell object inside each row
        if (updatedTableObj.tableContent) {
          updatedTableObj.tableContent = updatedTableObj.tableContent.map(
            (row: any) => {
              const existingCells = row.cells || [];

              // Check if the cell with the same tableHeaderId already exists
              const cellAlreadyExists = existingCells.some(
                (cell: any) => cell.tableHeaderId === id
              );

              if (!cellAlreadyExists) {
                const newCell = {
                  id: uuidv4(),
                  tableId: updatedTableObj.tableId,
                  tableHeaderId: id,
                  columnName: newAttributeName,
                  columnType: rowFieldType,
                  value: "",
                  datatype: "text",
                  dataOptions: "",
                };

                return {
                  ...row,
                  cells: [...existingCells, newCell],
                };
              } else {
                return {
                  ...row,
                  cells: existingCells,
                };
              }
            }
          );
        }

        return updatedTableObj;
      });

      return {
        ...prevFormData,
        tableFields: updatedTables,
      };
    });

    setTempColumn(null); // Clear the temporary column
  };

  const updateTableHeader = (numColumns: number, tableId: string) => {
    const newTableHeader = Array.from({ length: numColumns }, () => ({
      id: uuidv4(),
      type: "",
      attributeName: "",
      rowFieldType: "label",
    }));

    setFormData((prevFormData: any) => ({
      ...prevFormData,
      tableFields: prevFormData.tableFields.map((tableItem: any) => {
        if (tableItem.tableId === tableId) {
          const key = Object.keys(tableItem).find((k) => k !== "tableId");
          return {
            ...tableItem,
            [key as string]: newTableHeader,
          };
        }
        return tableItem;
      }),
    }));
  };

  // const handleSelectForTableColumns = (value: any) => {
  //   setNumberofColumnsForTable(value);
  //   updateTableHeader(value);
  // };

  //--------final submit of data-----------
  const submitData = async () => {
    const updatedFormData = {
      ...formData,
      createdBy: userInfo.id, // Add the createdBy field here
    };
    const response = await axios.post(
      `/api/auditchecksheet/createAuditChecksheetTemplate`,
      updatedFormData
    );
    if (response.status === 200 || response.status === 201) {
      navigate("/checksheet");
    }
  };

  //--------update Data-----------------
  const updateData = async () => {
    const response = await axios.patch(
      `/api/auditchecksheet/updateAuditChecksheetTemplate/${selectedId}`,
      formData
    );
    if (response.status === 200 || response.status === 201) {
      navigate("/checksheet");
    }
  };

  //----------to target and store the table cell value -------------
  const handleInputChangeValue = (
    tableId: string,
    cellId: string,
    newValue: any
  ) => {
    setFormData((prevData: any) => {
      const updatedTables = prevData.tableFields.map((table: any) => {
        if (table.tableId !== tableId) return table;

        const mergedGroup = table.mergedCells?.find((group: any) =>
          group.mergedIds.includes(cellId)
        );

        const cellIdsToUpdate = mergedGroup ? mergedGroup.mergedIds : [cellId];

        const updatedContent = table.tableContent.map((row: any) => {
          const updatedCells = row.cells.map((cell: any) => {
            if (cellIdsToUpdate.includes(cell.id)) {
              return {
                ...cell,
                value:
                  typeof newValue === "object"
                    ? { ...cell.value, ...newValue }
                    : newValue,
              };
            }
            return cell;
          });

          return { ...row, cells: updatedCells };
        });

        return { ...table, tableContent: updatedContent };
      });

      return { ...prevData, tableFields: updatedTables };
    });
  };

  //--------to get table Data from the api ------------
  const getTableData = async () => {
    const result = await axios.get(
      `/api/auditchecksheet/getAuditChecksheetTemplateById/${selectedId}`
    );

    const data = result.data;

    setFormData(data);
    getWorkflowDetails(data.workflowId);

    // Extract and set the formHeader data to selectedValues
    const extractedValues = data.formHeader.map((item: any) => ({
      id: item?.id,
      datatype: item.datatype,
      dataOptions: item.dataOptions,
    }));

    setSelectedValues(extractedValues);

    setTitle(data?.title);
    const formHeaderLabels =
      data?.formHeader?.map((item: any) => item.attributeName) || [];

    setInputs(formHeaderLabels);
    //setNumberofColumnsForTable(data?.tableHeader?.length);
    //setInputCount(data?.formHeader?.length);

    const validTypes = ["label", "specification", "value", "remarks"] as const;

    type RowFieldType = (typeof validTypes)[number];

    const rowFieldTypeMap: Record<RowFieldType, number> = {
      label: 1,
      specification: 2,
      value: 3,
      remarks: 4,
    };

    const mappedData: Record<string, number> = {};

    data?.tableFields?.forEach((table: any) => {
      table?.tableHeader?.forEach((header: any, index: number) => {
        const key = `${table.tableId}-${index}`;
        const fieldType = header.rowFieldType;

        if (validTypes.includes(fieldType)) {
          mappedData[key] = rowFieldTypeMap[fieldType as RowFieldType];
        } else {
          mappedData[key] = 1; // default to 'label'
        }
      });
    });
    setVisibleIndices(mappedData);
  };

  //------ table header type selection function (label,specialation,value)-------
  const updateRowFieldType = (
    value: string,
    tableId: string,
    index: number
  ) => {
    const updatedTableFields = formData.tableFields.map((table: any) => {
      if (table.tableId === tableId) {
        const updatedTableHeader = [...table.tableHeader];
        updatedTableHeader[index].rowFieldType = value;
        const updateTableContentColumnType = table.tableContent.map(
          (item: any) => {
            return {
              ...item,
              cells: item.cells.map((cell: any) => {
                if (cell.tableHeaderId === updatedTableHeader[index].id) {
                  return {
                    ...cell,
                    columnType: value,
                  };
                } else {
                  return cell;
                }
              }),
            };
          }
        );
        return {
          ...table,
          tableHeader: updatedTableHeader,
          tableContent: updateTableContentColumnType,
        };
      }
      return table;
    });

    setFormData({
      ...formData,
      tableFields: updatedTableFields,
    });
  };

  // modal functions

  const showModal2 = (
    rowIndex: any,
    value: any,
    index: any,
    columnType: any,
    tableId: any,
    cellId: any
  ) => {
    // Find the correct table
    const table = formData.tableFields.find(
      (table: any) => table.tableId === tableId
    );

    if (table) {
      // Instead of finding by 'row', directly access by rowIndex
      const row = table.tableContent[rowIndex];

      if (row) {
        // Find the correct cell inside the row by cellId
        const cell = row.cells.find((cellData: any) => cellData.id === cellId);

        if (cell) {
          setClickedCell({
            rowIndex,
            value,
            index,
            columnType,
            tableId,
            cellId,
          });
          setIsModalOpen(true);
          setSelectedField(cell.datatype);
          setSelectedFormula(cell.dataOptions);
          setSelectedFieldToleranceType(cell?.toleranceType);
          setSelectedFieldToleranceValue(cell?.toleranceValue);
          setSelectedCellDatatypes({
            rowIndex,
            value,
            index,
            tableId,
            cellId,
            dataType: cell.datatype,
            dataOptions: cell.dataOptions,
            toleranceType: cell?.toleranceType,
            toleranceValue: cell?.toleranceValue,
          });
          setModalClose(false);
        }
      }
    }
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setModalClose(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Form header accordian open and close function
  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  const handleAccordionChange1 = () => {
    setExpanded1(!expanded1);
  };

  const handleChangeFormHeaderTitle = (e: any) => {
    setFormData({
      ...formData,
      formHeaderTitle: e,
    });
  };

  const handleChangeTableHeaderTitle = (e: any, tableId: any) => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      tableFields: prevFormData.tableFields.map((t: any) =>
        t.tableId === tableId ? { ...t, tableHeaderTitle: e } : t
      ),
    }));
  };

  const handleTableWorkflowChange = (e: any, tableId: any) => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      tableFields: prevFormData.tableFields.map((t: any) =>
        t.tableId === tableId ? { ...t, workflowStages: e } : t
      ),
    }));
  };

  const handleNext = (tableId: string, index: number) => {
    const key = `${tableId}-${index}`;
    setVisibleIndices((prevIndices: any) => {
      const currentIndex = prevIndices[key] ?? 0;
      const newIndex = (currentIndex % 4) + 1; // 1 to 4 cycle
      updateRowFieldType(indexToValue(newIndex), tableId, index);
      return {
        ...prevIndices,
        [key]: newIndex,
      };
    });
  };

  // Function to map index to corresponding value
  const indexToValue = (index: number) => {
    switch (index) {
      case 1:
        return "label";
      case 2:
        return "specification";
      case 3:
        return "value";
      case 4:
        return "remarks";
      default:
        return "label";
    }
  };

  // prompt function for form delete
  const showDeleteConfirm = (index: any) => {
    confirm({
      title: "Are you sure you want to delete?",
      // content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteInput(index);
      },
      onCancel() {},
    });
  };

  // Function to render the visible text based on index for table column type
  const renderVisibleText = (tableId: string, index: number) => {
    const texts = ["L", "L", "S", "V", "R"];
    const key = `${tableId}-${index}`;
    const visibleIndex = visibleIndices[key] ?? 0;
    return (
      <Tooltip
        title={
          texts[visibleIndex] === "L"
            ? "Label"
            : texts[visibleIndex] === "S"
            ? "Specification"
            : texts[visibleIndex] === "V"
            ? "Value"
            : texts[visibleIndex] === "R"
            ? "Remarks"
            : "Label"
        }
      >
        <p
          style={{
            width: "25px",
            height: "25px",
            border: "2px solid black",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "12px",
            backgroundColor: "#a7f1a7",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {texts[visibleIndex]}
        </p>
      </Tooltip>
    );
  };

  // promt function for table column delete
  const showDeleteColumnConfirm = (tableId: any, columnId: any) => {
    confirm({
      title: "Are you sure you want to delete this column?",
      // content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteColumn(tableId, columnId);
      },
      onCancel() {},
    });
  };

  // delete function for the table column
  const deleteColumn = (tableId: string, columnId: string) => {
    setFormData((prevFormData: any) => {
      const updatedTables = prevFormData.tableFields.map((tableFields: any) => {
        if (tableFields.tableId !== tableId) {
          return tableFields; // other tables unchanged
        }

        // Step 1: Find the actual tableHeader key (dynamic key)
        const tableHeaderKey = Object.keys(tableFields).find((key) =>
          key.startsWith("tableHeader")
        );

        if (!tableHeaderKey) {
          return tableFields; // safety check
        }

        // Step 2: Remove the column from tableHeader
        const updatedTableHeader = tableFields[tableHeaderKey].filter(
          (header: any) => header.id !== columnId
        );

        // Step 3: Remove the related cells from tableContent
        const updatedTableContent = tableFields.tableContent.map(
          (row: any) => ({
            ...row,
            cells: row.cells.filter(
              (cell: any) => cell.tableHeaderId !== columnId
            ),
          })
        );

        return {
          ...tableFields,
          [tableHeaderKey]: updatedTableHeader,
          tableContent: updatedTableContent,
        };
      });

      return {
        ...prevFormData,
        tableFields: updatedTables,
      };
    });

    // Optional: If you want to decrease columns count
    //setNumberofColumnsForTable((prev) => prev - 1);
  };

  // Utility function to capitalize the first letter of each word
  const capitalizeFirstLetter = (str: any) => {
    if (Array.isArray(str)) {
      return "Multi Value Options";
    } else {
      return str.replace(/\b\w/g, (char: any) => char.toUpperCase());
    }
  };

  //--------------------------
  const handleAddTable = () => {
    const newTableObj = {
      tableId: crypto.randomUUID(),
      tableHeader: [],
      tableContent: [],
    };

    setFormData((prev: any) => ({
      ...prev,
      tableFields: [...(prev.tableFields || []), newTableObj],
    }));
  };

  const handleAddSection = () => {
    const newTableObj = {
      sectionId: crypto.randomUUID(),
      sectionContent: [],
    };

    setFormData((prev: any) => ({
      ...prev,
      tableFields: [...(prev.tableFields || []), newTableObj],
    }));
  };

  const handleChangeWorkflow = (value: any) => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      workflowId: value,
      tableFields: prevFormData?.tableFields?.map((item: any) => ({
        ...item,
        workflowStages: [],
      })),
    }));
    getWorkflowDetails(value);
  };

  const getWorkflows = async () => {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL
        }/api/global-workflow/getGlobalWorkflowTableData?page=${0}&limit=${0}`
      );
      setWorkflowList(response.data.tableData);
    } catch (error) {
      console.error("Error fetching upload status:", error);
    }
  };

  const getWorkflowDetails = async (id: any) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/global-workflow/getGlobalWorkflowById/${id}`
      );
      setWorkflowDetails(response.data);
    } catch (error) {
      console.error("Error fetching upload status:", error);
    }
  };

  const [openMenu, setOpenMenu] = useState<{
    tableId: string;
    rowIndex: number;
  } | null>(null);

  //===============//=========================

  const [selectedRows, setSelectedRows] = useState<Record<string, number[]>>(
    {}
  );

  const handleCheckboxChange = (
    checked: boolean,
    tableId: string,
    rowIndex: number
  ) => {
    setSelectedRows((prev) => {
      const existing = prev[tableId] || [];
      if (checked) {
        // Add rowIndex if not already in the array
        return {
          ...prev,
          [tableId]: Array.from(new Set([...existing, rowIndex])),
        };
      } else {
        // Remove the rowIndex
        const updated = existing.filter((index) => index !== rowIndex);
        const newState = { ...prev, [tableId]: updated };
        if (updated.length === 0) {
          delete newState[tableId];
        }
        return newState;
      }
    });
  };

  const handleDeleteSelectedRows = (tableId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete selected rows?",
      onOk: () => {
        setFormData((prev: any) => {
          if (!prev || !Array.isArray(prev.tableFields)) return prev;

          const updatedTableFields = prev.tableFields.map((table: any) => {
            if (table.tableId !== tableId) return table;

            const rowIndexes = selectedRows[tableId];
            if (!rowIndexes) return table;

            const filteredContent = table.tableContent.filter(
              (_: any, index: number) => !rowIndexes.includes(index)
            );

            return {
              ...table,
              tableContent: filteredContent,
            };
          });

          return {
            ...prev,
            tableFields: updatedTableFields,
          };
        });

        // Only remove selected rows of the current table
        setSelectedRows((prev) => {
          const newSelected = { ...prev };
          delete newSelected[tableId];
          return newSelected;
        });
      },
    });
  };

  const handleCopyRow = (tableId: any, rowIndex: any, direction = "down") => {
    // Copy the current formData state before mutating
    const newFormData = { ...formData };

    const tableIndex = newFormData.tableFields.findIndex(
      (table: any) => table.tableId === tableId
    );

    if (tableIndex === -1) {
      console.error("Table not found");
      return;
    }

    const table = newFormData.tableFields[tableIndex];
    const originalRow = table.tableContent[rowIndex];

    if (!originalRow) {
      console.error("Row not found");
      return;
    }

    // Deep copy cells and assign new UUIDs
    const newRow = {
      ...originalRow,
      row: originalRow.row + 0.1, // Temporary row number, will re-index below
      cells: originalRow.cells.map((cell: any) => ({
        ...cell,
        id: uuidv4(),
      })),
    };

    // Insert the new row in the correct position
    const insertIndex = direction === "down" ? rowIndex + 1 : rowIndex;
    table.tableContent.splice(insertIndex, 0, newRow);

    // Re-index the rows to have continuous row numbers
    table.tableContent = table.tableContent.map((row: any, idx: any) => ({
      ...row,
      row: idx + 1,
    }));

    // Update the formData
    setFormData(newFormData);
  };

  //---------------free-flow---------------------

  const [formFields, setFormFields] = useState<any[]>([]);
  const [customLabel, setCustomLabel] = useState("");
  const [customWidth, setCustomWidth] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [customHeight, setCustomHeight] = useState("");
  const { TextArea } = Input;
  const { Option } = Select;
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const fieldTypes = [
    {
      id: "Text",
      label: "Text",
      component: "Input",
    },

    {
      id: "Image",
      label: "Image",
      component: "ImageUpload",
    },
    {
      id: "Attachment",
      label: "Attachment",
      component: "Attachment",
    },
    {
      id: "MultipleTypes",
      label: "Fields",
      component: "Input",
    },
    {
      id: "Space",
      label: "Space",
      Component: "",
    },
  ];

  const DraggableField = ({ field }: any) => {
    return (
      <div
        style={{
          margin: "8px",
          padding: "8px",
          border: "1px solid #999",
          borderRadius: 4,
          cursor: "move",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#fff",
        }}
      >
        {field.id === "Text" && <EditOutlined />}
        {field.id === "Image" && <PictureOutlined />}
        {(field.id === "Attachment" || field.id === "MultipleTypes") && (
          <DownSquareOutlined />
        )}
        {field.id === "Space" && <CgSpaceBetweenV />}
        {field.label}
      </div>
    );
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Palette to Canvas (adding new field)
    if (
      source.droppableId === "palette" &&
      destination.droppableId.startsWith("canvas-")
    ) {
      const sectionId = destination.droppableId.replace("canvas-", "");
      const fieldType = fieldTypes.find((f: any) => f.id === draggableId);
      if (fieldType) {
        setSelectedField(fieldType);
        setCustomLabel(fieldType.label);
        setCustomWidth("");
        setIsModalVisible(true);
        setActiveSectionId(sectionId);
      }
      return;
    }

    // Reordering inside canvas section
    if (
      source.droppableId === destination.droppableId &&
      source.droppableId.startsWith("canvas-")
    ) {
      const sectionId = source.droppableId.replace("canvas-", "");
      setFormData((prev: any) => {
        const updatedTableFields = prev.tableFields.map((sectionObj: any) => {
          if (sectionObj.sectionId === sectionId) {
            const newFields = [...sectionObj.sectionContent];
            const [movedField] = newFields.splice(source.index, 1);
            newFields.splice(destination.index, 0, movedField);
            return {
              ...sectionObj,
              sectionContent: newFields,
            };
          }
          return sectionObj;
        });

        return { ...prev, tableFields: updatedTableFields };
      });
    }
  };

  const handleModalOk = () => {
    if (!activeSectionId || !selectedField) return;

    setFormData((prev: any) => {
      const updatedTableFields = prev.tableFields.map((field: any) => {
        if (field.sectionId === activeSectionId) {
          const sectionContent = field.sectionContent || [];

          // If editing
          if (selectedField.uniqueId) {
            const updatedContent = sectionContent.map((f: any) =>
              f.uniqueId === selectedField.uniqueId
                ? {
                    ...f,
                    label: customLabel,
                    width: customWidth,
                    ...(selectedField.id === "Image" && {
                      height: customHeight,
                    }),
                    ...(selectedField.id === "Select" && {
                      options: customOptions,
                    }),
                    ...(selectedField.id === "Image" && { imageUrl: "" }),
                    ...(selectedField.id === "MultipleTypes" && {
                      datatype: selectedField2,
                      dataOptions: selectedFormula2,
                    }),
                    ...(selectedField.id === "Text" && {
                      fontSize: customFontSize,
                      textAlign: customTextAlign,
                      fontWeight: customFontWeight,
                    }),
                  }
                : f
            );

            return {
              ...field,
              sectionContent: updatedContent,
            };
          }

          // If new field
          const uniqueId = `${selectedField.id}-${Date.now()}`;
          const newField = {
            ...selectedField,
            label: customLabel,
            width: customWidth,
            uniqueId,
            ...(selectedField.id === "Image" && { height: customHeight }),
            ...(selectedField.id === "Select" && { options: customOptions }),
            ...(selectedField.id === "Image" && { imageUrl: "" }),
            ...(selectedField.id === "MultipleTypes" && {
              datatype: selectedField2,
              dataOptions: selectedFormula2,
            }),
            ...(selectedField.id === "Text" && {
              fontSize: customFontSize,
              textAlign: customTextAlign,
              fontWeight: customFontWeight,
            }),
          };

          return {
            ...field,
            sectionContent: [...sectionContent, newField],
          };
        }
        return field;
      });

      return {
        ...prev,
        tableFields: updatedTableFields,
      };
    });

    // Clear modal state
    setIsModalVisible(false);
    setSelectedField(null);
    setCustomLabel("");
    setCustomWidth("");
    setCustomHeight("");
    setCustomOptions([]);
    setNewOption("");
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    // setSelectedField(null);
    setCustomOptions([]);
    setNewOption("");
  };

  const handleEditField = (field: any, sectionId: string) => {
    setSelectedField(field);
    setCustomLabel(field.label);
    setCustomWidth(field.width);
    setCustomOptions(field.properties?.options || []);
    setSelectedField2(field.datatype || "");
    setSelectedFormula2(field.dataOptions || "");
    setCustomHeight(field.height || "");
    setCustomFontSize(field.fontSize || null);
    setCustomTextAlign(field.textAlign || "start");
    setCustomFontWeight(field.fontWeight || "normal");
    setActiveSectionId(sectionId); // 🔥 this is the key fix
    setIsModalVisible(true);
  };

  //----------------data types----------------

  const getData = async () => {
    const res = await axios.get("/api/auditchecksheet/checksheetAppField");
    const data = res?.data;

    const appFieldsData = data
      .filter((item: any) => item.type === "appFields")
      .map((item: any) => ({ value: item.id, label: item.name }));

    const entityTypesData = data
      .filter((item: any) => item.type === "entityType")
      .map((item: any) => ({ value: item.id, label: item.name }));

    setAppFields(appFieldsData);
    setEntityTypes(entityTypesData);
  };

  const [optionsForUoM, setOptionsForUoM] = useState([
    { value: "Kg", label: "Kg" },
    { value: "Meter", label: "Meter" },
    { value: "Nm", label: "Nm" },
    { value: "Hrs", label: "Hrs" },
    { value: "cm", label: "cm" },
    { value: "mm", label: "mm" },
  ]);

  const handleChange = (value: any) => {
    setSelectedField2(value);
    setSelectedFormula2("");
    updateSelectedValues(value, "");
  };

  const handleChangeFormula = (value: any) => {
    setSelectedFormula2(value);
    updateSelectedValues("formula", value);
  };

  const updateSelectedValues = (datatype: string, dataOptions: any) => {
    setSelectedValues2({
      datatype,
      dataOptions,
    });
  };

  const addMultiValueInput = () => {
    const existing = selectedValues2.dataOptions || [];
    updateSelectedValues("multiValue", [...existing, ""]);
  };

  const handleMultiValueInputChange = (inputIndex: number, value: string) => {
    const updated = [...(selectedValues2.dataOptions || [])];
    updated[inputIndex] = value;
    updateSelectedValues("multiValue", updated);
  };

  //--------/-------------------

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Button
        type="primary"
        onClick={() => {
          handleAddTable();
          setPopoverVisible(false);
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
      >
        Create New Table
      </Button>
      <Button
        onClick={() => {
          handleAddSection();
          setPopoverVisible(false);
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
      >
        Add New Section
      </Button>
    </div>
  );

  //----------merge cells ------------------------

  const handleUnmerge = (tableId: string) => {
    setFormData((prevData: any) => {
      const updatedTables = prevData.tableFields.map((table: any) => {
        if (table.tableId !== tableId) return table;

        const updatedMergedCells =
          table.mergedCells?.filter((group: any) =>
            group.mergedIds.every((id: string) => !selectedCells[id])
          ) || [];

        return {
          ...table,
          mergedCells: updatedMergedCells,
        };
      });

      return { ...prevData, tableFields: updatedTables };
    });

    setSelectedCells({});
  };

  // ----------column width --------------
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [newColumnWidth, setNewColumnWidth] = useState<number | undefined>(
    undefined
  );

  const [currentTableId, setCurrentTableId] = useState<string | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);

  return (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          padding: " 15px 20px",
        }}
      >
        <div></div>
        <div>
          {selectedId ? (
            <AntButton
              type="primary"
              onClick={updateData}
              style={{
                backgroundColor: "#003059",
                color: "white",
              }}
            >
              Update
            </AntButton>
          ) : (
            <AntButton
              type="primary"
              onClick={submitData}
              style={{
                backgroundColor: "#003059",
                color: "white",
              }}
            >
              Submit
            </AntButton>
          )}
          <Button
            onClick={() => {
              navigate("/checksheet");
            }}
            style={{
              backgroundColor: "#003059",
              color: "white",
              marginLeft: "5px",
            }}
          >
            Back
          </Button>
        </div>
      </div>
      <Accordion
        style={{ marginTop: "0px" }}
        className={classes.headingRoot}
        expanded={expanded1}
        onChange={handleAccordionChange1}
      >
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          className={classes.summaryRoot}
        >
          <div>
            <label
              style={{
                fontSize: "18px",
                color: "#003059",
                fontWeight: "bold",
                marginLeft: "20px",
              }}
            >
              Form Details
            </label>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.headingRoot}>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              padding: " 0px 20px",
            }}
          >
            <div>
              <div>
                <label
                  style={{
                    fontSize: "18px",
                    color: "#003059",
                    fontWeight: "bold",
                  }}
                >
                  Form Title :{" "}
                </label>
                <Input
                  placeholder="Form Title"
                  style={{ width: 250, marginLeft: "15px" }}
                  onChange={(e) => handleChangeTitle(e.target.value)}
                  value={title}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    color: "#003059",
                    fontWeight: "bold",
                  }}
                >
                  Workflow :{" "}
                </label>
                <Select
                  placeholder="Select Workflow"
                  style={{ width: 250, marginLeft: "20px", color: "black" }}
                  onChange={handleChangeWorkflow}
                  value={formData?.workflowId ?? ""}
                >
                  <Select.Option key="none" value="none">
                    None
                  </Select.Option>

                  {workflowList &&
                    workflowList.map((workflow: any) => (
                      <Select.Option key={workflow._id} value={workflow._id}>
                        {workflow.title}
                      </Select.Option>
                    ))}
                </Select>
              </div>
            </div>
            {/* <div>
              {selectedId ? (
                <AntButton
                  type="primary"
                  onClick={updateData}
                  style={{
                    backgroundColor: "#003059",
                    color: "white",
                  }}
                >
                  Update
                </AntButton>
              ) : (
                <AntButton
                  type="primary"
                  onClick={submitData}
                  style={{
                    backgroundColor: "#003059",
                    color: "white",
                  }}
                >
                  Submit
                </AntButton>
              )}
              <Button
                onClick={() => {
                  navigate("/checksheet");
                }}
                style={{
                  backgroundColor: "#003059",
                  color: "white",
                  marginLeft: "5px",
                }}
              >
                Back
              </Button>
            </div> */}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* <Accordion
        style={{ marginTop: "0px" }}
        className={classes.headingRoot}
        expanded={expanded}
        onChange={handleAccordionChange}
      >
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          className={classes.summaryRoot}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Input
              placeholder="Form Header Title"
              style={{ width: 200, marginLeft: "15px" }}
              onChange={(e) => handleChangeFormHeaderTitle(e.target.value)}
              value={formData?.formHeaderTitle}
            />
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.headingRoot}>
          <div style={{ padding: "20px", width: "100%" }}>
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Button
                  onClick={addInput}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#003059",
                    color: "white",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {" "}
                  <FaPlus /> Add Field
                </Button>

                <div
                  style={{
                    marginLeft: "30px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <label style={{ fontWeight: "bold", color: "#003059" }}>
                    No of Columns to Display :{" "}
                  </label>
                  <InputNumber
                    min={0}
                    max={100}
                    value={formData.formLayout}
                    onChange={handleFormLayoutChange}
                    style={{ width: 100, marginLeft: "10px", color: "black" }}
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {inputs.map((input, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    marginBottom: 10,
                    flexDirection: "column",
                  }}
                >
                  <div>
                    <Input
                      placeholder={`Column ${index + 1}`}
                      value={input}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      style={{ width: 200, marginRight: 10 }}
                      suffix={
                        <Tooltip
                          title={
                            finalData[index]?.datatype ? (
                              <>
                                <p>{`Data Type : ${capitalizeFirstLetter(
                                  finalData[index]?.datatype || "N/A"
                                )}`}</p>
                                <p>{`Data Objects : ${capitalizeFirstLetter(
                                  finalData[index]?.dataOptions || "N/A"
                                )}`}</p>
                              </>
                            ) : (
                              <>
                                <p>Data Type Is Not Assigned Yet</p>
                              </>
                            )
                          }
                          color="#669999"
                        >
                          <AiOutlineDownCircle
                            onClick={() => toggleModal(index)}
                          />
                        </Tooltip>
                      }
                    />

                    <AiOutlineDelete
                      onClick={() => showDeleteConfirm(index)}
                      style={{ cursor: "pointer", color: "black" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                    }}
                  >
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        justifyContent: "start",
                      }}
                    >
                      {showModal[index] && (
                        <ChecklistInformationModal
                          setSelectedValues={setSelectedValues}
                          selectedValues={selectedValues}
                          index={index}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion> */}

      <div
        style={{
          display: "flex",
          justifyContent: "end",
          width: "100%",
          margin: "10px",
          padding: "0px 30px",
        }}
      >
        <Popover
          content={content}
          trigger="click"
          visible={popoverVisible}
          onVisibleChange={(visible) => setPopoverVisible(visible)}
          placement="bottom"
        >
          <Button
            style={{
              cursor: "pointer",
              backgroundColor: "#003059",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaPlus /> Add
          </Button>
        </Popover>
      </div>

      {formData?.tableFields?.map((tableObj: any, index: number) => {
        if (tableObj.tableId) {
          const { tableId, ...rest } = tableObj;
          const tableKey = Object.keys(rest).find((key) =>
            key.startsWith("tableHeader")
          );
          const tableHeader = rest[tableKey!];

          const columns = tableHeader.map((attr: any, colIndex: number) => {
            return {
              title: () => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%", // ensure it fills full column width
                    minWidth: 0, // allow shrinkage
                  }}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 1, maxRows: 10 }}
                    value={
                      tempColumn && tempColumn.id === attr.id
                        ? tempColumn.attributeName
                        : attr.attributeName
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      if (tempColumn?.id === attr.id) {
                        setTempColumn({ ...tempColumn, attributeName: newVal });
                      } else {
                        setTempColumn({ id: attr.id, attributeName: newVal });
                      }
                    }}
                    placeholder="Enter column name"
                    style={{
                      width: "100%", // take up as much space as allowed
                      flex: 1, // grow with the parent
                      marginRight: "8px",
                      minWidth: 0,
                    }}
                  />
                  <span
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    {renderVisibleText(tableId, colIndex)}
                    {!attr.attributeName?.trim() && (
                      <Tooltip title="Select Column Field Type">
                        <AiOutlineRetweet
                          onClick={() => handleNext(tableId, colIndex)}
                          style={{ fontSize: "20px" }}
                        />
                      </Tooltip>
                    )}
                  </span>

                  {tempColumn?.id === attr.id && (
                    <Button
                      onClick={() =>
                        saveColumnName(
                          colIndex,
                          tempColumn.attributeName,
                          attr.id,
                          attr.rowFieldType,
                          tableId
                        )
                      }
                      icon={<AiOutlineCheckCircle />}
                      style={{ marginLeft: "5px" }}
                    />
                  )}

                  <Popover
                    trigger="click"
                    placement="bottomRight"
                    content={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                          onClick={() => handleNext(tableId, colIndex)}
                        >
                          <AiOutlineRetweet /> Change Field Type
                        </div>
                        <div
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                          onClick={() => {
                            setIsEditingMode(true);
                            setEditingColumnId(attr.id);
                            setCurrentTableId(tableId);
                            setNewColumnWidth(
                              attr.width
                                ? Number(attr.width.replace("%", ""))
                                : undefined
                            );
                            setIsAddColumnModalOpen(true);
                          }}
                        >
                          <AiOutlineEdit /> Edit
                        </div>

                        <div
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                          onClick={() =>
                            showDeleteColumnConfirm(tableId, attr.id)
                          }
                        >
                          <AiOutlineDelete /> Delete
                        </div>
                      </div>
                    }
                  >
                    <IoMdMore
                      style={{
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    />
                  </Popover>
                </div>
              ),
              dataIndex: attr.attributeName.toLowerCase().replace(/\s+/g, "_"),
              ...(attr.width ? { width: attr.width } : {}),
              render: (text: any, record: any, rowIndex: number) => {
                const columnName = attr.attributeName;
                const cell = record.cells.find(
                  (c: any) => c.columnName === columnName
                );

                const isChecked = selectedCells[cell?.id] || false;
                return (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) =>
                        setSelectedCells((prev) => ({
                          ...prev,
                          [cell.id]: e.target.checked,
                        }))
                      }
                    />
                    {cell &&
                    cell.columnType === "specification" &&
                    cell.datatype === "numberRange" ? (
                      <>
                        <Input
                          type="number"
                          value={cell?.minValue || ""}
                          placeholder="Min"
                          onChange={(e) =>
                            handleInputChangeValue(tableId, cell.id, {
                              min: parseFloat(e.target.value) || "",
                            })
                          }
                        />
                        _
                        <Input
                          type="number"
                          value={cell?.maxValue || ""}
                          placeholder="Max"
                          onChange={(e) =>
                            handleInputChangeValue(tableId, cell.id, {
                              max: parseFloat(e.target.value) || "",
                            })
                          }
                          suffix={
                            cell && (
                              <Tooltip
                                placement="top"
                                title={
                                  <div>
                                    {cell.datatype ? (
                                      <>
                                        <p>Datatype: {cell.datatype}</p>
                                        <p>
                                          Data Options: {cell.dataOptions || ""}
                                        </p>
                                      </>
                                    ) : (
                                      <p>Data Type is not assigned yet</p>
                                    )}
                                  </div>
                                }
                                color="#669999"
                              >
                                <AiOutlineDownCircle
                                  onClick={() =>
                                    showModal2(
                                      rowIndex,
                                      cell.value,
                                      index,
                                      cell.columnType,
                                      tableId,
                                      cell.id
                                    )
                                  }
                                />
                              </Tooltip>
                            )
                          }
                        />
                        {cell.datatype === "numberRange" && (
                          <span style={{ fontSize: "14px" }}>
                            {cell.dataOptions}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {cell?.datatype === "number" ? (
                          <Input
                            type="number"
                            value={cell?.value || ""}
                            onChange={(e) =>
                              handleInputChangeValue(
                                tableId,
                                cell.id,
                                parseFloat(e.target.value) || ""
                              )
                            }
                            suffix={
                              cell && (
                                <>
                                  {(cell.columnType === "specification" ||
                                    cell.columnType === "label" ||
                                    cell.columnType === "remarks" ||
                                    cell.columnType === "None") && (
                                    <Tooltip
                                      placement="top"
                                      title={
                                        <div>
                                          {cell.datatype ? (
                                            <>
                                              <p>Datatype: {cell.datatype}</p>
                                              <p>
                                                Data Options:{" "}
                                                {cell.dataOptions || "N/A"}
                                              </p>
                                            </>
                                          ) : (
                                            <p>Data Type is not assigned yet</p>
                                          )}
                                        </div>
                                      }
                                      color="#669999"
                                    >
                                      <AiOutlineDownCircle
                                        onClick={() =>
                                          showModal2(
                                            rowIndex,
                                            cell.value,
                                            index,
                                            cell.columnType,
                                            tableId,
                                            cell.id
                                          )
                                        }
                                      />
                                    </Tooltip>
                                  )}
                                  {cell.datatype === "number" && (
                                    <span style={{ fontSize: "14px" }}>
                                      {cell.dataOptions}{" "}
                                      {cell.toleranceType === "tolerance" &&
                                        cell.toleranceValue &&
                                        `(-${cell.toleranceValue.min}/+${cell.toleranceValue.max})`}
                                    </span>
                                  )}
                                </>
                              )
                            }
                          />
                        ) : (
                          <div style={{ position: "relative", width: "100%" }}>
                            <Input.TextArea
                              autoSize={{ minRows: 1, maxRows: 8 }}
                              value={cell?.value || ""}
                              onChange={(e) =>
                                handleInputChangeValue(
                                  tableId,
                                  cell.id,
                                  e.target.value
                                )
                              }
                              // onPaste={(e) => {
                              //   const pasteText =
                              //     e.clipboardData.getData("text");
                              //   handleInputChangeValue(
                              //     tableId,
                              //     cell.id,
                              //     pasteText
                              //   );
                              //   e.preventDefault(); // optional: stop default paste if needed
                              // }}
                              style={{ paddingRight: 30 }} // add space for the icon
                            />
                            {(cell?.columnType === "specification" ||
                              cell?.columnType === "label" ||
                              cell?.columnType === "remarks" ||
                              cell?.columnType === "None") && (
                              <Tooltip
                                placement="top"
                                title={
                                  <div>
                                    {cell.datatype ? (
                                      <>
                                        <p>Datatype: {cell.datatype}</p>
                                        <p>
                                          Data Options:{" "}
                                          {cell.dataOptions || "N/A"}
                                        </p>
                                      </>
                                    ) : (
                                      <p>Data Type is not assigned yet</p>
                                    )}
                                  </div>
                                }
                                color="#669999"
                              >
                                <AiOutlineDownCircle
                                  style={{
                                    position: "absolute",
                                    right: 8,
                                    top: 8,
                                    cursor: "pointer",
                                    color: "#555",
                                  }}
                                  onClick={() =>
                                    showModal2(
                                      rowIndex,
                                      cell.value,
                                      index,
                                      cell.columnType,
                                      tableId,
                                      cell.id
                                    )
                                  }
                                />
                              </Tooltip>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              },
              onCell: (_record: any, rowIndex: number) => {
                if (!mergeEnabled) return {};

                const cell = tableObj.tableContent[rowIndex]?.cells.find(
                  (c: any) => c.columnName === attr.attributeName
                );
                if (!cell) return {};

                const mergedGroups = tableObj.mergedCells || [];

                for (const group of mergedGroups) {
                  const groupIds = group.mergedIds;
                  if (!groupIds.includes(cell.id)) continue;

                  const groupRowIndexes = tableObj.tableContent
                    .map((row: any, idx: any) => {
                      const match = row.cells.find((c: any) =>
                        groupIds.includes(c.id)
                      );
                      return match ? idx : null;
                    })
                    .filter((i: any) => i !== null);

                  const firstIndex = groupRowIndexes[0];
                  if (rowIndex === firstIndex) {
                    return { rowSpan: groupRowIndexes.length };
                  } else if (groupRowIndexes.includes(rowIndex)) {
                    return { rowSpan: 0 };
                  }
                }

                return {};
              },
            };
          });

          const fullColumns = [
            ...columns,
            {
              title: "",
              key: "actions",
              align: "center",
              render: (_: any, record: any, rowIndex: number) => {
                const isOpen =
                  openMenu?.tableId === tableId &&
                  openMenu?.rowIndex === rowIndex;
                const isChecked =
                  selectedRows[tableId]?.includes(rowIndex) || false;

                const handleMenuClick = ({ key }: any) => {
                  if (key === "delete") handleDeleteRow(tableId, rowIndex);
                  else if (key === "add") handleAddRow(tableId, rowIndex);
                  else if (key === "moveUp")
                    handleMoveRow(tableId, rowIndex, "up");
                  else if (key === "moveDown")
                    handleMoveRow(tableId, rowIndex, "down");
                  else if (key === "copy")
                    handleCopyRow(tableId, rowIndex, "down");
                  // Close the menu after an action is selected
                  setOpenMenu(null);
                };

                const menu = (
                  <Menu onClick={handleMenuClick}>
                    <Menu.Item key="delete" icon={<AiOutlineDelete />}>
                      Delete Row
                    </Menu.Item>
                    <Menu.Item key="add" icon={<AiOutlinePlusCircle />}>
                      Add Row Below
                    </Menu.Item>
                    <Menu.Item key="moveUp" icon={<FaLongArrowAltUp />}>
                      Move Up
                    </Menu.Item>
                    <Menu.Item key="moveDown" icon={<FaLongArrowAltDown />}>
                      Move Down
                    </Menu.Item>
                    <Menu.Item key="copy" icon={<RiFileCopy2Fill />}>
                      Copy Row
                    </Menu.Item>
                  </Menu>
                );

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    {/* Dropdown Menu Button */}
                    <Dropdown
                      overlay={menu}
                      trigger={["click"]}
                      visible={isOpen}
                      onVisibleChange={(visible) => {
                        if (visible) {
                          setOpenMenu({ tableId, rowIndex });
                        } else if (isOpen) {
                          setOpenMenu(null);
                        }
                      }}
                    >
                      <IoMdMenu
                        style={{ cursor: "pointer", fontSize: "24px" }}
                      />
                    </Dropdown>

                    {/* Checkbox Button */}
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) =>
                        handleCheckboxChange(
                          e.target.checked,
                          tableId,
                          rowIndex
                        )
                      }
                    />
                  </div>
                );
              },
            },
          ];

          return (
            <Accordion key={tableId} defaultExpanded>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls={`panel-${index}-content`}
                id={`panel-${index}-header`}
                className={classes.summaryRoot}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    placeholder="Table Header Title"
                    style={{ width: 200, marginLeft: "15px" }}
                    onChange={(e) =>
                      handleChangeTableHeaderTitle(e.target.value, tableId)
                    }
                    value={tableObj.tableHeaderTitle}
                  />
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {Object.keys(selectedCells).length !== 0 &&
                  Object.values(selectedCells).some((v) => v) ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        if (!tableId) return;

                        const selectedIds = Object.keys(selectedCells).filter(
                          (id) => selectedCells[id]
                        );
                        if (selectedIds.length <= 1) return;

                        // Save to formData
                        setFormData((prevData: any) => {
                          const updatedTables = prevData.tableFields.map(
                            (table: any) => {
                              if (table.tableId !== tableId) return table;

                              const existingMerged = table.mergedCells || [];
                              return {
                                ...table,
                                mergedCells: [
                                  ...existingMerged,
                                  { mergedIds: selectedIds },
                                ],
                              };
                            }
                          );

                          return { ...prevData, tableFields: updatedTables };
                        });

                        setMergeEnabled(true);
                        setSelectedCells({});
                      }}
                    >
                      Merge Cells
                    </Button>
                  ) : null}
                  {Object.keys(selectedCells).length !== 0 &&
                  Object.values(selectedCells).some((v) => v) ? (
                    <Button danger onClick={() => handleUnmerge(tableId)}>
                      Unmerge Cells
                    </Button>
                  ) : null}
                  <Tooltip title="Delete Table">
                    <RiDeleteBin2Fill
                      style={{ fontSize: "20px", cursor: "pointer" }}
                      onClick={() => habdleDeleteTableConfirm(tableId)}
                    />
                  </Tooltip>

                  {selectedRows[tableId]?.length > 0 && (
                    <Tooltip title="Delete Selected Rows">
                      <MdDelete
                        style={{ fontSize: "20px", cursor: "pointer" }}
                        onClick={() => handleDeleteSelectedRows(tableId)}
                      />
                    </Tooltip>
                  )}
                </div>
              </AccordionSummary>

              <AccordionDetails>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        width: "50%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                        }}
                      >
                        <Button
                          // onClick={() => addColumnsForTable(tableId)}
                          onClick={() => {
                            setCurrentTableId(tableId);

                            setIsAddColumnModalOpen(true);
                          }}
                          style={{
                            cursor: "pointer",
                            backgroundColor: "#003059",
                            color: "white",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {" "}
                          <FaPlus /> Add Column
                        </Button>
                      </div>

                      <Modal
                        title={
                          isEditingMode
                            ? "Edit Column Width"
                            : "Add New Column Width"
                        }
                        open={isAddColumnModalOpen}
                        onOk={() => {
                          if (currentTableId) {
                            if (isEditingMode && editingColumnId) {
                              // EDIT mode
                              setFormData((prevFormData: any) => ({
                                ...prevFormData,
                                tableFields: prevFormData.tableFields.map(
                                  (tableItem: any) => {
                                    if (tableItem.tableId === currentTableId) {
                                      const key = Object.keys(tableItem).find(
                                        (k) => k !== "tableId"
                                      );
                                      const updatedHeader = tableItem[
                                        key as string
                                      ].map((col: any) => {
                                        if (col.id === editingColumnId) {
                                          const updatedCol = { ...col };
                                          if (
                                            newColumnWidth &&
                                            newColumnWidth > 0
                                          ) {
                                            updatedCol.width = `${newColumnWidth}%`;
                                          } else {
                                            delete updatedCol.width;
                                          }
                                          return updatedCol;
                                        }
                                        return col;
                                      });

                                      return {
                                        ...tableItem,
                                        [key as string]: updatedHeader,
                                      };
                                    }
                                    return tableItem;
                                  }
                                ),
                              }));
                            } else {
                              // ADD mode
                              const newColumn = {
                                id: uuidv4(),
                                type: "",
                                attributeName: "",
                                rowFieldType: "label",
                                ...(newColumnWidth
                                  ? { width: `${newColumnWidth}%` }
                                  : {}),
                              };

                              setFormData((prevFormData: any) => ({
                                ...prevFormData,
                                tableFields: prevFormData.tableFields.map(
                                  (tableItem: any) => {
                                    if (tableItem.tableId === currentTableId) {
                                      const key = Object.keys(tableItem).find(
                                        (k) => k !== "tableId"
                                      );
                                      return {
                                        ...tableItem,
                                        [key as string]: [
                                          ...tableItem[key as string],
                                          newColumn,
                                        ],
                                      };
                                    }
                                    return tableItem;
                                  }
                                ),
                              }));
                            }

                            // reset and close modal
                            setIsAddColumnModalOpen(false);
                            setNewColumnWidth(undefined);
                            setIsEditingMode(false);
                            setEditingColumnId(null);
                          }
                        }}
                        onCancel={() => setIsAddColumnModalOpen(false)}
                      >
                        <p>Enter Column Width (%)</p>
                        <InputNumber
                          min={0}
                          max={100}
                          value={newColumnWidth}
                          onChange={(value: any) => setNewColumnWidth(value)}
                          addonAfter="%"
                          style={{ width: "100%" }}
                        />
                      </Modal>

                      {tableHeader.length > 0 && (
                        <AntButton
                          onClick={() => addRow(tableId)}
                          style={{
                            cursor: "pointer",
                            backgroundColor: "#003059",
                            color: "white",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <FaPlus /> Add Row
                        </AntButton>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        width: "50%",
                        justifyContent: "end",
                      }}
                    >
                      <div
                        style={{
                          width: "90%",
                          display: "flex",
                          gap: "20px",
                          alignItems: "center",
                        }}
                      >
                        <label style={{ fontWeight: "bold", color: "#003059" }}>
                          Select Owners :
                        </label>
                        <Select
                          mode="multiple"
                          allowClear
                          style={{ width: "80%" }}
                          placeholder="Please select Workflow Stage"
                          value={tableObj.workflowStages}
                          onChange={(e) =>
                            handleTableWorkflowChange(e, tableId)
                          }
                          options={
                            workflowDetails?.workflow?.map((item: any) => ({
                              label: item.stage,
                              value: item.stage,
                            })) || []
                          }
                        />
                      </div>
                      <Tooltip title="Delete ALL Table Data">
                        <RiDeleteBin4Fill
                          style={{ fontSize: "20px", cursor: "pointer" }}
                          onClick={() => habdleDeleteAllConfirm(tableId)}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedTableId(tableId)}
                    // style={{ padding: "20px" }}
                    className={classes.tableContainer}
                  >
                    <Table
                      columns={fullColumns}
                      dataSource={tableObj.tableContent || []}
                      pagination={false}
                      rowKey={(record, rowIndex) => `row-${rowIndex}`}
                    />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          );
        } else {
          const sectionId = tableObj.sectionId;
          const sectionFields = tableObj.sectionContent || [];

          return (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="palette" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      display: "flex",
                      gap: 12,
                      marginBottom: 20,
                      padding: "8px",
                      background: "#f0f0f0",
                      borderRadius: 4,
                      position: "relative",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      {fieldTypes.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <DraggableField field={field} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    <Tooltip title="Delete Section">
                      {" "}
                      <DeleteOutlined
                        onClick={() => {
                          setFormData((prev: any) => {
                            const updatedTableFields = prev.tableFields.filter(
                              (item: any) => item.sectionId !== sectionId
                            );
                            return {
                              ...prev,
                              tableFields: updatedTableFields,
                            };
                          });
                        }}
                        style={{
                          fontSize: 16,
                          color: "red",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                      />
                    </Tooltip>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <Droppable droppableId={`canvas-${sectionId}`}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: "300px",
                      padding: "16px",
                      background: "#e6f7ff",
                      border: "1px dashed #1890ff",
                      borderRadius: 4,
                    }}
                  >
                    {sectionFields.length === 0 ? (
                      <p>{"Drop here"}</p>
                    ) : (
                      <Form layout="vertical" style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {sectionFields.map((field: any, index: any) => (
                            <Draggable
                              key={field.uniqueId}
                              draggableId={field.uniqueId}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    width: field.width
                                      ? `${Math.max(
                                          parseInt(field.width) - 1,
                                          1
                                        )}%`
                                      : "32.33%",
                                    ...(field.height
                                      ? { height: field.height }
                                      : {}),
                                    position: "relative",
                                    marginBottom: "30px",
                                  }}
                                >
                                  <Form.Item
                                    style={{
                                      marginBottom: 0,
                                      padding: "0px 10px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        marginBottom: 4,
                                        paddingRight: "45px",
                                      }}
                                    >
                                      <span style={{ fontWeight: 600 }}>
                                        {field.label}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: 12,
                                          color: "black",
                                        }}
                                      >
                                        {field.width}
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div style={{ flex: 1 }}>
                                        {field.id === "Attachment" ? (
                                          <field.component>
                                            Attachment
                                          </field.component>
                                        ) : field.id === "Image" ? (
                                          <Upload
                                            listType="picture-card"
                                            showUploadList={false}
                                            beforeUpload={() => false}
                                            onChange={(info) => {
                                              const latestFile =
                                                info.fileList[
                                                  info.fileList.length - 1
                                                ];
                                              const file =
                                                latestFile?.originFileObj;

                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                  const imageUrl = e.target
                                                    ?.result as string;

                                                  const updatedTableFields =
                                                    formData.tableFields.map(
                                                      (sectionObj: any) => {
                                                        if (
                                                          sectionObj.sectionId ===
                                                          sectionId
                                                        ) {
                                                          const newSectionContent =
                                                            [
                                                              ...sectionObj.sectionContent,
                                                            ];
                                                          const fieldToUpdate =
                                                            {
                                                              ...newSectionContent[
                                                                index
                                                              ],
                                                            };

                                                          fieldToUpdate.properties =
                                                            {
                                                              ...fieldToUpdate.properties,
                                                              imageUrl,
                                                            };

                                                          newSectionContent[
                                                            index
                                                          ] = fieldToUpdate;

                                                          return {
                                                            ...sectionObj,
                                                            sectionContent:
                                                              newSectionContent,
                                                          };
                                                        }
                                                        return sectionObj;
                                                      }
                                                    );

                                                  setFormData({
                                                    ...formData,
                                                    tableFields:
                                                      updatedTableFields,
                                                  });
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                            }}
                                            className={classes.image}
                                          >
                                            <div
                                              style={{
                                                width: "100%",
                                                height: "100%",
                                                // objectFit: "cover",
                                              }}
                                            >
                                              {field.properties?.imageUrl ? (
                                                <img
                                                  src={
                                                    field.properties.imageUrl
                                                  }
                                                  alt="uploaded"
                                                  style={{
                                                    width: "100%",
                                                    height:
                                                      field.height || "auto",
                                                    objectFit: "fill",
                                                    display: "block",
                                                  }}
                                                />
                                              ) : (
                                                <div>
                                                  <PlusOutlined />
                                                  <div style={{ marginTop: 8 }}>
                                                    Upload
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </Upload>
                                        ) : field.id === "Space" ? (
                                          <div></div>
                                        ) : (
                                          <Input.TextArea
                                            autoSize={{
                                              minRows: 1,
                                              maxRows: 10,
                                            }}
                                            style={{ width: "100%" }}
                                            value={field.value || ""}
                                            onChange={(e: any) => {
                                              const updatedTableFields =
                                                formData.tableFields.map(
                                                  (sectionObj: any) => {
                                                    if (
                                                      sectionObj.sectionId ===
                                                      sectionId
                                                    ) {
                                                      const newSectionContent =
                                                        [
                                                          ...sectionObj.sectionContent,
                                                        ];
                                                      newSectionContent[index] =
                                                        {
                                                          ...newSectionContent[
                                                            index
                                                          ],
                                                          value: e.target.value,
                                                        };
                                                      return {
                                                        ...sectionObj,
                                                        sectionContent:
                                                          newSectionContent,
                                                      };
                                                    }
                                                    return sectionObj;
                                                  }
                                                );

                                              setFormData({
                                                ...formData,
                                                tableFields: updatedTableFields,
                                              });
                                            }}
                                            onPaste={(e: any) => {
                                              const pasteText =
                                                e.clipboardData.getData("text");

                                              const updatedTableFields =
                                                formData.tableFields.map(
                                                  (sectionObj: any) => {
                                                    if (
                                                      sectionObj.sectionId ===
                                                      sectionId
                                                    ) {
                                                      const newSectionContent =
                                                        [
                                                          ...sectionObj.sectionContent,
                                                        ];
                                                      newSectionContent[index] =
                                                        {
                                                          ...newSectionContent[
                                                            index
                                                          ],
                                                          value: pasteText,
                                                        };
                                                      return {
                                                        ...sectionObj,
                                                        sectionContent:
                                                          newSectionContent,
                                                      };
                                                    }
                                                    return sectionObj;
                                                  }
                                                );

                                              setFormData({
                                                ...formData,
                                                tableFields: updatedTableFields,
                                              });

                                              // Optional: prevent default paste to avoid double updates
                                              e.preventDefault();
                                            }}
                                          />
                                        )}
                                      </div>
                                      <div
                                        style={{
                                          marginLeft: 8,
                                          display: "flex",
                                          gap: 4,
                                        }}
                                      >
                                        <EditOutlined
                                          style={{ cursor: "pointer" }}
                                          onClick={() =>
                                            handleEditField(field, sectionId)
                                          }
                                        />
                                        <DeleteOutlined
                                          onClick={() => {
                                            setFormData((prev: any) => {
                                              const updatedTableFields =
                                                prev.tableFields.map(
                                                  (field: any) => {
                                                    if (
                                                      field.sectionId ===
                                                      sectionId
                                                    ) {
                                                      const newSectionContent =
                                                        field.sectionContent.filter(
                                                          (_: any, i: number) =>
                                                            i !== index
                                                        );
                                                      return {
                                                        ...field,
                                                        sectionContent:
                                                          newSectionContent,
                                                      };
                                                    }
                                                    return field;
                                                  }
                                                );

                                              return {
                                                ...prev,
                                                tableFields: updatedTableFields,
                                              };
                                            });
                                          }}
                                          style={{
                                            cursor: "pointer",
                                            color: "red",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </Form.Item>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                      </Form>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          );
        }
      })}

      <Modal
        title="Basic"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        open={isModalOpen}
        closable={false}
        footer={[
          <Button key="ok" type="primary" onClick={handleOk}>
            OK
          </Button>,
        ]}
      >
        <DataTypeforTableCells
          clickedCell={clickedCell}
          selectedCellDatatypes={selectedCellDatatypes}
          setSelectedCellDatatypes={setSelectedCellDatatypes}
          modalClose={modalClose}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          selectedFormula={selectedFormula}
          setSelectedFormula={setSelectedFormula}
          selectedFieldToleranceType={selectedFieldToleranceType}
          setSelectedFieldToleranceType={setSelectedFieldToleranceType}
          selectedFieldToleranceValue={selectedFieldToleranceValue}
          setSelectedFieldToleranceValue={setSelectedFieldToleranceValue}
          showCustomMultiValueInput={showCustomMultiValueInput}
          setShowCustomMultiValueInput={setShowCustomMultiValueInput}
          newOption={newOption}
          setNewOption={setNewOption}
        />
      </Modal>

      {/* //---------free flow - modal----------------- */}

      <Modal
        title="Set Field Properties"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Label:</div>
          <Input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Enter field label"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Width (px):</div>
          <InputNumber
            value={parseInt(customWidth)}
            onChange={(value: number | null) => {
              setCustomWidth(`${value}%`);
            }}
            min={1}
            max={100}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            Recommended: 0-100 %
          </div>
        </div>
        {selectedField?.id === "Select" && (
          <div>
            <div style={{ marginBottom: 8 }}>Options:</div>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Enter option"
                  // onPressEnter={handleAddOption}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  // onClick={handleAddOption}
                  disabled={!newOption}
                >
                  Add
                </Button>
              </div>
              <div style={{ marginTop: 8 }}>
                {customOptions.map((option) => (
                  <Tag
                    key={option}
                    closable
                    // onClose={() => handleRemoveOption(option)}
                    style={{ margin: 4 }}
                  >
                    {option}
                  </Tag>
                ))}
              </div>
            </Space>
          </div>
        )}
        {selectedField?.id === "Image" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>Height (%):</div>
            <InputNumber
              value={parseInt(customHeight)}
              onChange={(value: number | null) => {
                setCustomHeight(`${value}vw`);
              }}
              min={0}
              max={1000}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {selectedField?.id === "MultipleTypes" && (
          <div style={{ padding: " 0px 10px 10px 10px" }}>
            <p style={{ fontWeight: "bold", color: "#003059" }}>Data Type :</p>
            <Select
              showSearch
              placeholder="Please Select"
              style={{ width: 200 }}
              onChange={handleChange}
              value={selectedField2}
              options={[
                { value: "entityType", label: "Entity Type" },
                { value: "appFields", label: "App Fields" },
                { value: "text", label: "Text" },
                { value: "number", label: "Number" },
                { value: "multiValue", label: "MultiValue" },
                { value: "currentDate", label: "Current Date" },
                { value: "dateSelection", label: "Date Selection" },
                { value: "formula", label: "Formula" },
                { value: "yesNo", label: "Yes / No" },
                { value: "@user", label: "@User" },
                { value: "email", label: "Email" },
              ]}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />

            {selectedField2 === "entityType" && (
              <div>
                <p style={{ fontWeight: "bold", color: "#003059" }}>
                  Options :
                </p>
                <Select
                  placeholder="Please Select"
                  style={{ width: 200 }}
                  onChange={(value) =>
                    updateSelectedValues("entityType", value)
                  }
                  value={selectedFormula2}
                  options={entityTypes}
                />
              </div>
            )}

            {selectedField2 === "appFields" && (
              <div>
                <p style={{ fontWeight: "bold", color: "#003059" }}>
                  Options :
                </p>
                <Select
                  placeholder="Please Select"
                  style={{ width: 200 }}
                  onChange={(value) => updateSelectedValues("appFields", value)}
                  value={selectedFormula2}
                  options={appFields}
                />
              </div>
            )}

            {selectedField2 === "number" && (
              <div>
                <p style={{ fontWeight: "bold", color: "#003059" }}>
                  Options :
                </p>
                <Select
                  showSearch
                  placeholder="Please Select"
                  style={{ width: 200 }}
                  onChange={(value) => updateSelectedValues("number", value)}
                  value={selectedFormula2}
                  options={optionsForUoM}
                />
              </div>
            )}

            {selectedField2 === "multiValue" && (
              <div>
                <p style={{ fontWeight: "bold", color: "#003059" }}>
                  Options :
                </p>
                {selectedValues2?.dataOptions &&
                  selectedValues2?.dataOptions?.map(
                    (field: string, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={field}
                          onChange={(e) =>
                            handleMultiValueInputChange(idx, e.target.value)
                          }
                          style={{ marginRight: 10, width: 200 }}
                        />
                        {idx === selectedValues2.dataOptions.length - 1 && (
                          <Button
                            icon={<AiOutlinePlusCircle />}
                            onClick={() => addMultiValueInput()}
                          />
                        )}
                      </div>
                    )
                  )}
                {!selectedValues2?.dataOptions && (
                  <Button
                    icon={<AiOutlinePlusCircle />}
                    onClick={() => addMultiValueInput()}
                  >
                    Add Option
                  </Button>
                )}
              </div>
            )}

            {selectedField2 === "formula" && (
              <div>
                <p style={{ fontWeight: "bold", color: "#003059" }}>
                  Options :
                </p>
                <Select
                  showSearch
                  placeholder="Please Select"
                  style={{ width: 200 }}
                  onChange={handleChangeFormula}
                  value={selectedFormula2}
                  options={[
                    { value: "sum", label: "Sum()" },
                    { value: "product", label: "Product()" },
                    { value: "percentage", label: "Percentage()" },
                    { value: "ratio", label: "Ratio()" },
                  ]}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </div>
            )}
          </div>
        )}

        {selectedField?.id === "Text" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>Font Size (px):</div>
            <InputNumber
              value={customFontSize}
              onChange={(value: number | null) => {
                setCustomFontSize(value || 0);
              }}
              min={8}
              max={100}
              style={{ width: "100%" }}
            />
            <div style={{ margin: "12px 0 8px" }}>Text Align:</div>
            <Select
              value={customTextAlign}
              onChange={(value: string) => setCustomTextAlign(value)}
              options={[
                { value: "start", label: "Start" },
                { value: "center", label: "Center" },
                { value: "end", label: "End" },
              ]}
              style={{ width: "100%" }}
              placeholder="Select text alignment"
            />

            <div style={{ margin: "12px 0 8px" }}>Font Weight:</div>
            <Select
              value={customFontWeight}
              onChange={(value: string) => setCustomFontWeight(value)}
              options={[
                { value: "normal", label: "Normal" },
                { value: "bold", label: "Bold" },
              ]}
              style={{ width: "100%" }}
              placeholder="Select font weight"
            />
          </div>
        )}
      </Modal>
      <div ref={bottomRef} />
    </>
  );
};

export default DesignTime;
