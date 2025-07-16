

export const queryGeneartorForDocumentsFilter = (filterArray) => {
     const filterCondtions = []

     for (const element of filterArray) {
          if (element.filterField == "docTypeName") {

               filterCondtions.push({
                    doctype: {
                         documentTypeName: {
                              contains: element.filterString,
                              mode: "insensitive"
                         }
                    }
               })
          } else if (element.filterField == "locationName") {
               filterCondtions.push({
                    doctype: {
                         location: {
                              [element.filterField]: {
                                   contains: element.filterString,
                                   mode: "insensitive"
                              }
                         }
                    }
               })
          } else if (element.filterField == "documentName") {
               filterCondtions.push({
                    [element.filterField]: {
                         contains: element.filterString,
                         mode: "insensitive"
                    }
               })
          } else if (element.filterField == "creator") {
               let firstName, lastName


               const nameArr = element.filterString?.split(" ")
               if (nameArr.length === 1 || 2) {
                    firstName = nameArr[0];
                    lastName = nameArr[1]

               }
              
               filterCondtions.push({
                    doctype: {
                         AND: [
                              {
                                   documentAdmins: {
                                        some: {
                                             type: {
                                                  contains: "CREATOR",
                                                  mode: "insensitive"
                                             }
                                        }
                                   }
                              },
                              {
                                   documentAdmins: {
                                        some: {
                                             OR: [
                                                  {
                                                       firstname: {
                                                            contains: firstName,
                                                            mode: "insensitive"
                                                       }
                                                  },
                                                  {
                                                       firstname: {
                                                            contains: lastName,
                                                            mode: "insensitive"
                                                       }
                                                  },
                                                  {
                                                       lastname: {
                                                            contains: firstName,
                                                            mode: "insensitive"
                                                       }
                                                  },
                                                  {
                                                       lastname: {
                                                            contains: lastName,
                                                            mode: "insensitive"
                                                       }
                                                  }
                                             ]
                                        }
                                   }
                              }

                         ]
                    }
               })
          } else {
               { }
          }
     }

     return filterCondtions
}

