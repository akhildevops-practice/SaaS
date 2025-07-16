import { useState } from "react";
import CustomTable2 from "../components/newComponents/CustomTable2";
import DATA from "./MOCK_DATA.json";

// import LeadToolsDocViewer from "../LeadtoolsEditor/LeadToolsDocViewer";

function TestPage() {
  const [data, setData] = useState(DATA);

  const cols = [
    {
      header: "First name",
      accessorKey: "first_name",
      enableGrouping: false,
      size: 500,
    },
    {
      header: "Last name",
      accessorKey: "last_name",
    },
    {
      header: "Email address",
      accessorKey: "email",
      enableGrouping: false,
      enableSorting: false,
    },
    {
      header: "Country",
      accessorKey: "country",
    },
    {
      header: "City",
      accessorKey: "city",
    },
  ];

  const handleBlur = (row: any) => {
    // console.log(row);
  };

  return (
    <div style={{ padding: "10px 20px" }}>
      <CustomTable2
        columns={cols}
        data={data}
        // editable={true}
        // setData={setData}
        // handleBlur={handleBlur}
        // rowGrouping={["country", "city"]}
        // enableCustomRowGrouping
        // enableColumnOrdering
        // enableColumnSorting
        // enableColumnResizing
        showToolbar
        // hiddenColumns={["email"]}
        actions={[
          {
            label: "test",
            handler: () => {},
          },
        ]}
      />
    </div>
  );
}

// function TestPage() {
//   return (
//     <Box height={1000}>
//       <LeadToolsDocViewer fileLink="https://demo.leadtools.com/images/pdf/leadtools.pdf" />
//     </Box>
//   );
// }

export default TestPage;
