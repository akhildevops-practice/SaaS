/**
 * @method fiscalYearGen
 * @description Function to generate a string financial year listing
 * @returns a string
 */
export const fiscalYearGen = () => {

const arr = []
const arr2 =[]
const year = new Date().getFullYear();

for ( let i = 30; i>= 0; i--) {
    arr.push(`${year - i} - ${(year - i) + 1}`)
    arr2.push(`${(year + i) - 1} - ${year + i}`)
}
arr2.reverse();
const finalar: any[]  =[...arr, ...arr2]
const final = Array.from(new Set(finalar))
return final;
}