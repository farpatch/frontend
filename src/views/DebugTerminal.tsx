import * as React from 'react';
import Terminal from './Terminal';

import Chip from '@mui/material/Chip';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';

class DebugTerminal extends React.Component<{}, { currentState: string }> {

    constructor(props: React.PropsWithChildren) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            currentState: "Initializing",
        };
    }

    handleChange(newState: string) {
        this.setState({ currentState: newState });
    }

    render() {
        return <Terminal ws="ws/debug" onStateChange={this.handleChange}  stateId='connection-status-Debug'>
            <Chip label={this.state.currentState} />
        </Terminal>;
    }
}

export default DebugTerminal;