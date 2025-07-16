/**
 * 
 * @param state The current state, needed to determine which options are returned
 * @param options Array of options
 * @returns Specific options for the current state
 */

function checkButtonOptions(state: any,options:string[]){
  const optionsArray : any = [];
  if(state === "DRAFT"){
    optionsArray.push(  "Save as Draft",
    "Send for Review",
  )
   }else if(state === "IN_REVIEW"){
    optionsArray.push("In Review")
   }else if(state === "REVIEW_COMPLETE"){
    optionsArray.push(
    "Send for Approval")
   }else if(state === "APPROVED"){
    optionsArray.push(
      "Publish")
   }else if(state === "IN_APPROVAL"){
    optionsArray.push(
      "In Approval")
   }else if(state === "PUBLISHED"){
    optionsArray.push(
      "Amend")
   }
   else if(state === "AMMEND"){
     optionsArray.push("Save as Draft", "Send for Review")
   }
   return optionsArray;
}

export default checkButtonOptions;