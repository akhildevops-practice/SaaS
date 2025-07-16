import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
    drawer: {
        '& .ant-drawer-header': {
            backgroundColor: 'aliceblue',
            textAlign: 'center',
            padding: '10px 20px',
            borderBottom: 'none',
        },
        '& .ant-drawer-body': {
            overflowY: 'hidden',
        },
        // "& .ant-drawer-content": {
        borderBottomRightRadius: '10px',
        borderBottomLeftRadius: '10px',
        // },
    },
    tabsWrapper: {
        '& .ant-tabs .ant-tabs-tab': {
            padding: '14px 9px',
            backgroundColor: '#F3F6F8',
            color: '#0E497A',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.8px',
        },
        '& .ant-tabs-tab-active': {
            padding: '14px 9px',
            backgroundColor: '#006EAD !important',
            color: '#fff !important',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.8px',
        },
        '& .ant-tabs-tab-active div': {
            color: 'white !important',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '0.8px',
        },
        '& .ant-tabs .ant-tabs-tab+.ant-tabs-tab': {
            margin: '0 0 0 25px',
        },
    },

    title: {
        fontSize: '20px',
        fontWeight: 500,
    },
    uploadSection: {
        '& .ant-upload-list-item-name': {
            color: 'blue !important',
        },
    },
    formBox: {
        marginTop: '15px',
    },
    root: {
        flexGrow: 1,
        maxWidth: 752,
        backgroundColor: 'white',
        padding: '10px',
    },
    demo: {
        '& .MuiListItem-giutters': {
            paddinRight: '0px',
        },
        '& .MuiListItem-root': {
            paddingTop: '0px',
        },
    },
    scrollableList: {
        maxHeight: '200px', // Set the height according to your needs
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            width: '10px',
            backgroundColor: 'white',
        },
        '&::-webkit-scrollbar-thumb': {
            borderRadius: '10px',
            backgroundColor: 'grey',
        },
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
    },
    status: {
        display: 'flex',
        justifyContent: 'end',
    },
    text: {
        fontSize: '16px',
        marginRight: '10px',
        marginTop: '1%',
    },
    switch: {
        marginTop: '2%',
    },
    tableContainer: {
        '& .ant-table-container': {
            // overflowX: "auto",
            marginTop: '2%',
            // overflowY: 'hidden',
            '& span.ant-table-column-sorter-inner': {
                color: '#380036',
            },
            '&::-webkit-scrollbar': {
                width: '5px',
                height: '10px', // Adjust the height value as needed
                backgroundColor: 'white',
            },
            '&::-webkit-scrollbar-thumb': {
                borderRadius: '10px',
                backgroundColor: 'grey',
            },
        },
        '& .ant-table-wrapper .ant-table-thead>tr>th': {
            padding: '12px 16px',
            fontWeight: 500,
            fontSize: '13px',
            backgroundColor: '#f7f7ff',
        },
        '& .ant-table-cell': {
            // backgroundColor : '#f7f7ff'
        },
        '& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before':
            {
                backgroundColor: 'black',
            },

        '& tr.ant-table-row': {
            borderRadius: 5,
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
        '& .ant-table-tbody >tr >td': {
            borderBottom: `1px solid black`, // Customize the border-bottom color here
        },
        '& .ant-table-row.ant-table-row-level-1': {
            backgroundColor: 'rgba(169,169,169, 0.1)',
        },
        '& .ant-table-thead .ant-table-cell': {
            backgroundColor: '#f7f7ff',
            color: 'black',
        },

        [theme.breakpoints.down('xs')]: {
            '& .ant-table-row:first-child': {
                width: '100%',
            },
        },
    },
}));

export default useStyles;
