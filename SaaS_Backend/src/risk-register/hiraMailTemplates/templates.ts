// mailTemplates.ts

export const getReviewerMailTemplate = (
    jobTitle: string,
    body: any,
    formattedDate: string,
    url: string,
    hiraPageUrl: string,
    createdByUserDetails: any
  ): string => {
    return `
      <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #003566; text-align: center;">Risk Initiated For Workflow</h2>
          <p>Hi,</p>
          <p>A Risk has been sent for review.</p>
          <p><strong>Job Title:</strong> ${jobTitle}</p>
          <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
          <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
          <p><strong>Created On:</strong> ${formattedDate}</p>
          <p><strong>Comment:</strong> ${body.reviewComment}</p>
          <p>Please click the link below to review / reject the Risk:</p>
          ${url}
          <p>Please click the link below to edit the Risk:</p>
          ${hiraPageUrl}
          <p>Thanks,</p>
          <p>${createdByUserDetails?.firstname + ' ' + createdByUserDetails?.lastname}</p>
          <p>${createdByUserDetails?.email}</p>
        </div>
      </div>`;
};
  
export const getApproverMailTemplate = (
  jobTitle: string,
  body: any,
  formattedDate: string,
  url: string,
  hiraPageUrl: string,
  createdByUserDetails: any
): string => {
  return `
  <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #003566; text-align: center;">Risk Requested For Approval</h2>
            <p>Hi,</p>
            <p>A Risk has been sent for your approval.</p>
            <p><strong>Job Title:</strong> ${jobTitle}</p>
            <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
            <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>

            <p><strong>Reviewer's Comments:</strong> ${
              body.reviewCompleteComment || 'N/A'
            }</p>
            <p>Please click the link below to approve / reject the Risk:</p>
            ${url}
            <p>Please Click the link below to edit the Risk:</p>
            ${hiraPageUrl}
            <p>Thanks,</p>
            <p>${
              createdByUserDetails?.firstname +
              ' ' +
              createdByUserDetails?.lastname
            }</p>
            <p>${createdByUserDetails?.email}</p>
          </div>
        </div>
    `;
};

export const getCreatorMailTemplateWhenHiraIsApproved = (
  body: any,
  formattedDate: string,
  hiraPageUrl: string,
  createdByUserDetails: any
): string => {
  return `
    <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #003566; text-align: center;">Risk Approval Confirmation</h2>
              <p>Hi,</p>
              <p>The Risk has been successfully approved.</p>
              <p><strong>Job Title:</strong> ${body?.jobTitle}</p>
              <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
              <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
              <p><strong>Approver's Comments:</strong> ${
                body.approveComment || 'N/A'
              }</p>

               <p>Please Click the link below to view the Risk:</p>
              ${hiraPageUrl}

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

export const getResponsiblePersonMailTempalateWhenHiraIsApproved = (
  body: any,
  formattedDate: string,
  hiraPageUrl: string,
  createdByUserDetails: any
): string => {
  return `
  <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
             <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
               <h2 style="color: #003566; text-align: center;">Risk Approval Notification</h2>
               <p>Hi,</p>
               <p>The Risk has been successfully approved.</p>
               <p>You are recieving this email as you were listed as one of the responsible person for this Risk</p>
               <p><strong>Job Title:</strong> ${body?.jobTitle}</p>
               <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
               <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
               <p><strong>Approver's Comments:</strong> ${
                 body.approveComment || 'N/A'
               }</p>
               <p>Please Click the link below to view the Risk:</p>
              ${hiraPageUrl}
               <p>Thanks,</p>
               <p>${
                createdByUserDetails?.firstname +
                 ' ' +
                 createdByUserDetails?.lastname
               }</p>
               <p>${createdByUserDetails?.email}</p>
             </div>
           </div>`;
}


export const getCreatorAndReviewerMailTemplateWhenHiraIsRejected = (
  body: any,
  hiraPageUrl: string,
  createdByUserDetails: any
): string => {
  return `
   <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #003566; text-align: center;">Risk Has Been Rejected!</h2>
              <p>Hi,</p>
              <p>Risk has been sent back for Edit.</p>
              <p><strong>Job Title:</strong> ${body?.jobTitle}</p>
              <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
              <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
              Comments : ${body.comments[0]?.commentText || 'N/A'}
              <p>Please Click the link below to edit the Risk:</p>
              ${hiraPageUrl}
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