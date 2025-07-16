import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    fabButton: {
        fontSize: theme.typography.pxToRem(12),
        backgroundColor: theme.palette.primary.light,
        color: '#fff',
        margin: '0 5px',
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        },
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
    },
    imgContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    emptyDataText: {
        fontSize: theme.typography.pxToRem(14),
        color: theme.palette.primary.main,
    },
    documentTable: {
        '&::-webkit-scrollbar-thumb': {
            borderRadius: '10px',
            backgroundColor: 'grey',
        },
    },
    tableContainer: {
        marginTop: '1%',
        maxHeight: 'calc(60vh - 14vh)', // Adjust the max-height value as needed
        overflowY: 'auto',
        overflowX: 'hidden',
        // fontFamily: "Poppins !important",
        '& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td': {
            borderInlineEnd: 'none',
        },
        '& .ant-table-thead .ant-table-cell': {
            backgroundColor: '#E8F3F9',
            // fontFamily: "Poppins !important",
            color: '#00224E',
        },
        '& span.ant-table-column-sorter-inner': {
            color: '#00224E',
            // color: ({ iconColor }) => iconColor,
        },
        '& span.ant-tag': {
            display: 'flex',
            width: '89px',
            padding: '5px 0px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px',
            color: 'white',
        },
        '& .ant-table-wrapper .ant-table-thead>tr>th': {
            position: 'sticky', // Add these two properties
            top: 0, // Add these two properties
            zIndex: 2,
            // padding: "12px 16px",
            fontWeight: 600,
            fontSize: '14px',
            padding: '6px 8px !important',
            // fontFamily: "Poppins !important",
            lineHeight: '24px',
        },
        '& .ant-table-tbody >tr >td': {
            // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
            borderBottom: 'black',
            padding: '4px 8px !important',
        },
        // '& .ant-table-wrapper .ant-table-container': {
        //     maxHeight: '420px', // Adjust the max-height value as needed
        //     overflowY: 'auto',
        //     overflowX: 'hidden',
        // },
        '& .ant-table-body': {
            // maxHeight: '150px', // Adjust the max-height value as needed
            // overflowY: 'auto',
            '&::-webkit-scrollbar': {
                width: '8px',
                height: '10px', // Adjust the height value as needed
                backgroundColor: '#e5e4e2',
            },
            '&::-webkit-scrollbar-thumb': {
                borderRadius: '10px',
                backgroundColor: 'grey',
            },
        },
        '& tr.ant-table-row': {
            // borderRadius: 5,
            cursor: 'pointer',
            transition: 'all 0.1s linear',

            '&:hover': {
                backgroundColor: 'white !important',
                boxShadow: '0 1px 5px 0px #0003',
                transform: 'scale(1.01)',

                '& td.ant-table-cell': {
                    backgroundColor: 'white !important',
                },
            },
        },
    },
    locSearchBox: {
        width: '100%',
        [theme.breakpoints.down('sm')]: {
            marginTop: theme.typography.pxToRem(10),
        },
    },

    searchBoxText: {
        marginTop: theme.typography.pxToRem(10),
        fontSize: '16px',
        fontWeight: 'normal',
    },
    topSectionLeft: {
        width: '60%',
        [theme.breakpoints.down('sm')]: {
            width: '60%',
        },
        display: 'flex',
        alignItems: 'center',
    },
    mrmtext: {
        fontSize: '17px',
        marginLeft: '8px',
        cursor: 'pointer',
    },

    icon: {
        cursor: 'pointer',
        fontSize: '20px',
    },
    root: {
        width: '100%',
        height: '100%',
        // maxHeight: 'calc(76vh - 2vh)', // Adjust the max-height value as needed
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '10px', // Adjust the height value as needed
            backgroundColor: '#e5e4e2',
        },
        '&::-webkit-scrollbar-thumb': {
            borderRadius: '10px',
            backgroundColor: 'grey',
        },
    },
    input: {
        width: '100%',
    },
    resize: { fontSize: theme.typography.pxToRem(14) },
    iconButton: {
        paddingLeft: '1rem',
    },
}));

export default useStyles;
