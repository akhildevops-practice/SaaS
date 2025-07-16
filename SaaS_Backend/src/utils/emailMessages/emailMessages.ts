export const emailMessageTemplate = {
    IN_REVIEW: (creator, document) => {
        return `            
            <p>${creator.firstname} ${creator.lastname} has sent ${document.documentName} for your review. Please review the document and provide your review comments . Click 'Review Complete' when you are done with the review </p>

            <p> <a href="http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}" target="_blank">http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}</a> </p>
        `
    },

    IN_APPROVAL: (creator, document) => {
        return `
        <p>${creator.firstname} ${creator.lastname} has sent ${document.documentName}
        for your approval. Please approve the
        document and provide your comments . Click
        'Approve' when you are done.</p>

        <p> <a href="http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}" target="_blank">http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}</a> </p>

        `
    },

    IN_EDIT: (creator, document) => {
        return `            
            <p>${creator.firstname} ${creator.lastname} has sent back your
            ${document.documentName} for further edits. Please review
            approver comments and modify the document. Click 'send for approval' when edits are complete.</p>

            <p> <a href="http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}" target="_blank">http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}</a> </p>
        `
    },

    APPROVED: (creator, document) => {
        return `
        <p>Congratulations! ${creator.firstname} ${creator.lastname} has
        approved your ${document.documentName}. Please Click
        'Publish' to make this document available for
        the distribution list.</p>

        <p> <a href="http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}" target="_blank">http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}</a> </p>
        `
    },

    REVIEW_COMPLETE: (creator, document) => {
        return `
        <p>${creator.firstname} ${creator.lastname} has
        completed the review of your document ${document.documentName}. </p>

        <p> <a href="http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}" target="_blank">http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}</a> </p>

        `
    },

    PUBLISHED: (creator, document) => {
        return `
        <p> ${creator.firstname} ${creator.lastname} has
        published a document ${document.documentName}. </p>

        <p> <a href="http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}" target="_blank">http://${document.organization.realmName}.localhost:3000/processdocuments/processdocument/viewprocessdocument/${document.id}</a> </p>
        `
    }

}