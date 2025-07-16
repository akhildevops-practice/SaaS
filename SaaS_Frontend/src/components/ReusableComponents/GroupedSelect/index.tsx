"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
  TextField,
  Typography,
  Collapse,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import {
  FiSearch,
  FiX as CloseIcon,
  FiChevronDown as KeyboardArrowDownIcon,
  FiCheck as CheckIcon,
  FiChevronUp as ExpandLessIcon,
  FiChevronDown as ExpandMoreIcon,
} from "react-icons/fi";

type Department = {
  id: string;
  name: string;
  entityTypeId?: string;
  entityTypeName?: string;
};

type EntityType = {
  id: string;
  name: string;
};

type GroupedSelectProps = {
  entityTypes: EntityType[];
  departmentsByType: Department[];
  selectedDepartment: Department | Department[] | null;
  onSelect: (id: string | string[], full: Department | Department[]) => void;
  onClear: () => void;
  allowSelectAll?: boolean;
  multiSelect?: boolean;
  title?: string;
  disabled?: boolean;
};

const useStyles = makeStyles((theme) => ({
  button: {
    width: "100%",
    justifyContent: "space-between",
    textTransform: "none",
    padding: theme.spacing(1, 2),
    minHeight: 40,
    border: `1px solid ${theme.palette.grey[300]}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.palette.grey[50],
    },
  },
  popover: {
    width: 450,
    maxHeight: 500,
    overflowY: "auto", // ENABLE SCROLL HERE
  },
  searchField: {
    margin: theme.spacing(1),
    width: "calc(100% - 16px)",
  },
  entityTypeContainer: {
    padding: theme.spacing(1),
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  entityTypeChip: {
    cursor: "pointer",
    margin: theme.spacing(0.5),
  },
  departmentsList: {
    maxHeight: 300,
    overflow: "auto",
  },
  selectedContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flex: 1,
    textAlign: "left",
  },
  selectedBadges: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
  },
  clearButton: {
    padding: 2,
    marginLeft: theme.spacing(0.5),
  },
  groupHeader: {
    backgroundColor: theme.palette.grey[100],
    fontWeight: "bold",
  },
  styledListItem: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const GroupedSelect: React.FC<GroupedSelectProps> = ({
  entityTypes,
  departmentsByType,
  selectedDepartment,
  onSelect,
  onClear,
  allowSelectAll = true,
  disabled = false,
  multiSelect = false,
  title = "Select Entity",
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const filtered = (typeId: string) => {
    const list = departmentsByType.filter(
      (item) => item.entityTypeId === typeId
    );
    return list.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getSelectedValues = () => {
    if (!selectedDepartment) return [];
    if (multiSelect && Array.isArray(selectedDepartment)) {
      return selectedDepartment.map((item) => item.id);
    }
    return [(selectedDepartment as Department).id];
  };

  const handleSelect = (departmentId: string) => {
    if (departmentId === "All") {
      onSelect("All", [] as Department[]);
      if (!multiSelect) handleClose();
      return;
    }

    const department = departmentsByType.find((d) => d.id === departmentId);
    if (!department) return;

    if (multiSelect) {
      const currentSelected = Array.isArray(selectedDepartment)
        ? selectedDepartment
        : [];
      const isSelected = currentSelected.some((d) => d.id === departmentId);

      if (isSelected) {
        const newSelected = currentSelected.filter(
          (d) => d.id !== departmentId
        );
        onSelect(
          newSelected.map((d) => d.id),
          newSelected
        );
      } else {
        const newSelected = [...currentSelected, department];
        onSelect(
          newSelected.map((d) => d.id),
          newSelected
        );
      }
    } else {
      onSelect(departmentId, department);
      handleClose();
    }
  };

  const isSelected = (departmentId: string) => {
    const selectedIds = getSelectedValues();
    return selectedIds.includes(departmentId);
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const renderSelected = () => {
    if (
      !selectedDepartment ||
      (multiSelect &&
        Array.isArray(selectedDepartment) &&
        selectedDepartment.length === 0)
    ) {
      return <Typography color="textSecondary">{title}</Typography>;
    }

    if (multiSelect && Array.isArray(selectedDepartment)) {
      return (
        <div className={classes.selectedBadges}>
          {selectedDepartment.slice(0, 3).map((item) => (
            <Chip
              key={item.id}
              label={
                item.entityTypeName
                  ? `${item.entityTypeName}: ${item.name}`
                  : item.name
              }
              size="small"
              variant="outlined"
            />
          ))}
          {selectedDepartment.length > 3 && (
            <Chip
              label={`+${selectedDepartment.length - 3} more`}
              size="small"
              variant="outlined"
            />
          )}
        </div>
      );
    }

    const dept = selectedDepartment as Department;
    return (
      <div className={classes.selectedContent}>
        <Chip
          label={dept.entityTypeName || "Unknown"}
          size="small"
          variant="outlined"
        />
        <Typography variant="body2" style={{ flex: 1 }}>
          {dept.name}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          <CloseIcon size={16} />
        </IconButton>
      </div>
    );
  };

  const filteredEntityTypes = selectedType
    ? entityTypes.filter((et) => et.id === selectedType)
    : entityTypes;

  return (
    <div>
      <Button
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        className={classes.button}
      >
        {renderSelected()}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div className={classes.popover}>
          <Box p={2}>
            <Typography variant="subtitle2" gutterBottom>
              Entity Type:
            </Typography>
            <div className={classes.entityTypeContainer}>
              {entityTypes.map((type) => (
                <Chip
                  key={type.id}
                  label={type.name}
                  color={selectedType === type.id ? "primary" : "default"}
                  className={classes.entityTypeChip}
                  variant="outlined"
                  onClick={() =>
                    setSelectedType(selectedType === type.id ? null : type.id)
                  }
                />
              ))}
              {selectedType && (
                <Chip
                  label="Show All"
                  variant="outlined"
                  onClick={() => setSelectedType(null)}
                />
              )}
            </div>
          </Box>

          <Divider />

          <TextField
            placeholder="Search entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            size="small"
            disabled={disabled}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch />
                </InputAdornment>
              ),
            }}
          />

          <List className={classes.departmentsList}>
            {allowSelectAll && !multiSelect && (
              <ListItem
                button
                onClick={() => handleSelect("All")}
                className={classes.styledListItem}
              >
                <ListItemIcon>
                  {isSelected("All") ? <CheckIcon /> : <Box width={24} />}
                </ListItemIcon>
                <ListItemText primary="All" />
              </ListItem>
            )}

            {filteredEntityTypes.map((entityType) => {
              const departments = filtered(entityType.id);
              if (!departments.length) return null;

              return (
                <React.Fragment key={entityType.id}>
                  <ListItem className={classes.groupHeader}>
                    <ListItemText primary={entityType.name} />
                  </ListItem>
                  {departments.map((dept) => (
                    <ListItem
                      key={dept.id}
                      button
                      onClick={() => handleSelect(dept.id)}
                      className={classes.styledListItem}
                      disabled={disabled}
                    >
                      <ListItemIcon>
                        {isSelected(dept.id) ? (
                          <CheckIcon />
                        ) : (
                          <Box width={24} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={dept.name} />
                    </ListItem>
                  ))}
                </React.Fragment>
              );
            })}
          </List>
        </div>
      </Popover>
    </div>
  );
};

export default GroupedSelect;
