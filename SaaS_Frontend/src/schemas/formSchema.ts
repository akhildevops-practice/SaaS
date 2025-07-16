import { generateUniqueId } from "../utils/uniqueIdGenerator";

export const formSchema = {
  title: "",
  isDraft: true,
  status: false,
  createdBy: "",
  publishedDate: "",
  locationName: [],
  sections: [
    {
      title: "",
      totalScore: 0,
      obtainedScore: 0,
      fieldset: [
        {
          id: generateUniqueId(10),
          title: "",
          inputType: "numeric",
          options: [
            {
              name: "yes",
              checked: false,
              value: 0,
            },
            {
              name: "no",
              checked: false,
              value: 0,
            },
            {
              name: "na",
              checked: false,
              value: 0,
            },
          ],
          value: "",
          questionScore: 0,
          score: [
            {
              name: "gt",
              value: 0,
              score: 0,
            },
            {
              name: "lt",
              value: 10,
              score: 0,
            },
          ],
          slider: true,
          open: false,
          required: true,
          hint: "",
          allowImageUpload: false,
          image: "",
          imageName: "",
          nc: {
            type: "",
            findingTypeId: "",
            comment: "",
            clause: "",
            severity: "",
            evidence: "",
            mainComments: "",
          },
        },
      ],
    },
  ],
  totalQuestions: 0,
  totalScore: 0,
  createdAt: "",
  updatedAt: "",
};
