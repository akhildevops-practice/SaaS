
export const notificationTypes = {
    docType: "document_type",
    document: "document"
}

export const notificationTargets = {
    creators: "creators",
    approvers: "approvers",
    reviewers: "reviewers"
}

export const notificationEvents = {


    docType: {

        creator: {
            type: "creator",
            /**
             * @param name Person Name
             * @param documentTypeName Documemt Type Name
             * @returns String
             */
            message: (name: string, documentTypeName: string) => {
                return`${name} has assigned you as a creator for the document type ${documentTypeName}`
            },
            style: "primary"
        },

        reviewer: {
            type: "reviewer",
            /**
             * @param name Person Name
             * @param documentTypeName Documemt Type Name
             * @returns String
             */
            message: (name: string, documentTypeName: string) => {
                return`${name} has assigned you as a reviewer for the document type ${documentTypeName}`
            },
            style: "primary"
        },

        approver: {
            type: "approver",
            /**
             * @param name Person Name
             * @param documentTypeName Documemt Type Name
             * @returns String
             */
            message: (name: string, documentTypeName: string) => {
                return`${name} has assigned you as an approver for the document type ${documentTypeName}`
            },
            style: "primary"
        }
    },

    document: {
        approver: {
            type: "approval",
            message: (name: string, document_name: string) => {
                return`${name} has sent ${document_name} for approval`
            },
            style: "primary"

        },
        reviewer: {
            type: "edit",
            message: (name: string, document_name: string) => {
                return`${name} has sent ${document_name} for review`
            },
            style: "primary"
        },
        creator: {
            type: "creator",
            /**
             * @param name Person Name
             * @param documentTypeName Document Type Name
             * @returns String
             */
            message: (name: string, documentTypeName: string) => {
                return`${name} has assigned you as a creator for the document ${documentTypeName}`
            },
            style: "primary"
        },
        
    }
}