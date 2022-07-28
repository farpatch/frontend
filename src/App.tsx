import * as React from "react";
import * as ReactRouterDom from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CustomTheme from './CustomTheme';
import { SnackbarProvider } from 'notistack';
import { Layout } from './components';

import DebugTerminal from './views/DebugTerminal';
import RttTerminal from './views/RttTerminal';
import SerialTerminal from './views/SerialTerminal';

import "./App.css";

class App extends React.Component {
    render() {
        const notistackRef: React.RefObject<any> = React.createRef();
        const onClickDismiss = (key: string | number | undefined) => () => {
            notistackRef.current.closeSnackbar(key);
        };

        return (
            <CustomTheme>
                <SnackbarProvider
                    maxSnack={3}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    ref={notistackRef}
                    action={(key) => (
                        <IconButton onClick={onClickDismiss(key)} size="small">
                            <CloseIcon />
                        </IconButton>
                    )}>
                    <Layout>
                        <ReactRouterDom.Routes>
                            <ReactRouterDom.Route path="/serial" element={<SerialTerminal />} />
                            <ReactRouterDom.Route path="/rtt" element={<RttTerminal/>} />
                            <ReactRouterDom.Route path="/debug" element={<DebugTerminal />} />
                            <ReactRouterDom.Route path="/ap" element={<Button variant="contained">This is an AP button</Button>} />
                            <ReactRouterDom.Route path="/*" element={<Button variant="contained">This is a MUI button</Button>} />
                        </ReactRouterDom.Routes>
                    </Layout>
                </SnackbarProvider>
            </CustomTheme>
        );
    }
}

export default App;