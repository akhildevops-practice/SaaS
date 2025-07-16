import React, { useState } from "react";
import AutoComplete from "components/AutoComplete"; // Adjust the import path accordingly

function TestPreviewFeature() {
  const [formData, setFormData] = useState({
    user: [],
  });

  const sampleUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: null,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: null,
    },
    // Add more sample users as needed
  ];

  return (
    <div>
      <h1>Test Page</h1>
      <AutoComplete
        suggestionList={sampleUsers}
        name="User"
        formData={formData}
        setFormData={setFormData}
        keyName="user"
        defaultValue={[]}
        labelKey="name"
        showAvatar={true}
      />
    </div>
  );
}

export default TestPreviewFeature;
