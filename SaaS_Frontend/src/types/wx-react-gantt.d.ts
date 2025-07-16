declare module "wx-react-gantt" {
  import { ComponentType } from "react";

  // Replace `any` with a specific type for Gantt, Toolbar, Willow, etc.
  export const Gantt: ComponentType<any>; // Or a more specific type if available
  export const ContextMenu: ComponentType<any>;
  export const Toolbar: any;
  export const Willow: ComponentType<any>;
  export const WillowDark: ComponentType<any>;

  export const defaultColumns: any;
  export const defaultEditorShape: any;
  export const defaultMenuOptions: any;
  export const defaultToolbarButtons: any;
}
