export const getReviewerMailTemplate = (
  documentInfo: any,
  body: any,

  createdByUserDetails: any,
): string => {
  return `
      <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #003566; text-align: center;">Risk Initiated For Workflow</h2>
         Following document has been created and sent for review
  DocumentType:${documentInfo.docType}
  DocumentName:${documentInfo.documentName}
  Corp Func/Unit:${documentInfo.creatorLocation.locationName}
  Department:${documentInfo.creatorEntity.entityName}
 
  Link:"${process.env.PROTOCOL}://${
    process.env.REDIRECT
  }/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}
          <p>Thanks,</p>
          <p>${
            createdByUserDetails?.firstname +
            ' ' +
            createdByUserDetails?.lastname
          }</p>
          <p>${createdByUserDetails?.email}</p>
        </div>
      </div>`;
};
