export function getNcCount(sections = []) {
  let count = 0;

  for (let checklist of sections) {
    for (let i = 0; i < checklist?.sections?.length; i++) {
      for (let j = 0; j < checklist.sections[i].fieldset.length; j++) {
        const field = checklist.sections[i].fieldset[j];

        // field?.nc?.type !==""
        if (
          field?.nc?.hasOwnProperty('type') &&
          // field?.nc?.type !== '' &&
          field?.nc?.type !== undefined &&
          field?.nc?.type !== null &&
          field?.nc?.type !==""
        ) {
          count++;
        }
      }
    }
  }
  return count;
}
