
declare global {
  interface Window {
    google: any;
    gapi: any;
    OneDrive: {
      open: (options: any) => void;
    };
    fwSettings: {
      widget_id: number;
      user: {
        name: string;
        email: string;
      };
      customFields: {
        cf_location: string;
        cf_entity: string;
      };
    };
    google: any;
    gapi: any;
    OneDrive: {
      open: (options: any) => void;
    };
    FreshworksWidget: (
      action: string,
      formType: string,
      user: { name: string; email: string; customFields: {} },

      options?: { formId?: number }
    ) => any;
  }
}

export {};
