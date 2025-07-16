import { Suspense } from "react";
import type { RouteObject } from "react-router";
import { Navigate } from "react-router-dom";

import DocumentTypeDetails from "pages/DocumentControl/DocumentTypeDetails";
import CustomLoadingComponent from "components/CustomLoadingComponent";
import ExpandedDocViewPage from "pages/DocumentControl/ExpandedDocViewPage";
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";
import InboxDocumentDrawer from "pages/CustomInbox/EditDocumentDrawer";
import DocumentControl from "pages/DocumentControl";
import DocViewer from "pages/DocViewer";
import DocumentTypeForm from "pages/DocumentControl/DocumentTypeForm";
import DocumentRender from "pages/DocumentControl/DocumentRender";
import FormBuilder from "components/Document/DocumentSettings/FormBuilder";

// import ManageReferenceDocument from "pages/ManageReferenceDocument";

type CustomeRouteObject = {
  protected?: boolean;
} & RouteObject;
export const documentRoutes: CustomeRouteObject[] = [
  {
    path: "/processdocuments/documenttype",
    protected: true,
    element: <DocumentTypeDetails />,
  },
  {
    path: "/processdocuments/documenttype/form",
    protected: true,
    element: <DocumentTypeForm />,
  },
  {
    path: "/processdocuments",
    element: <Navigate replace to="/processdocuments/processdocument" />,
  },
  {
    path: "/processdocuments/documenttypedetails",
    element: <DocumentTypeDetails />,
  },
  {
    path: "/processdocuments/processdocument",
    element: <DocumentControl />,
  },
  // {
  //   path: "/processdocuments/processdocument/newprocessdocument",
  //   element: <NewProcessDocument />,
  // },
  // {
  //   path: "/processdocuments/processdocument/newprocessdocument/:id",
  //   element: <NewProcessDocument />,
  // },
  {
    path: "/processdocuments/processdocument/viewprocessdocument/:id",
    element: (
      <Suspense
        fallback={
          <CustomLoadingComponent
            text={"Loading your document, please wait..."}
          />
        }
      >
        <ExpandedDocViewPage />
      </Suspense>
    ),
  },
  {
    path: "/processdocuments/fullformview",
    element: <DocumentDrawer />,
  },
  {
    path: "/Inbox/fullformview",
    element: <InboxDocumentDrawer />,
  },
  {
    path: "/processdocuments/viewdoc/:id",
    element: <ExpandedDocViewPage />,
  },
  {
    path: "/processdocuments/docviewer",
    element: <DocViewer />,
  },
  {
    path: "/processdocuments/createModal",
    element: <DocumentRender />,
  },
  {
    path: "/processdocuments/formbuilder",
    element: <FormBuilder />,
  },
  {
    path: "/processdocuments/formbuilder/:id",
    element: <FormBuilder />,
  },
];

export default documentRoutes;
