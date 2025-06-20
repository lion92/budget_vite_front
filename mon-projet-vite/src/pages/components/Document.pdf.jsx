import {Document, Page, PDFDownloadLink} from '@react-pdf/renderer';

const MyDoc = () => (
    <Document>
        <Page>
            <budget></budget>
        </Page>
    </Document>
);

const App = () => (
    <div>
        <PDFDownloadLink document={<MyDoc/>} fileName="somename.pdf">
            {({blob, url, loading, error}) =>
                loading ? 'Loading document...' : 'Download now!'
            }
        </PDFDownloadLink>
    </div>
);