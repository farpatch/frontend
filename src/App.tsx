import * as React from "react";
import Button from '@mui/material/Button';
import "./App.css";

class App extends React.Component {
    render() {
        return (
            <>
                <div className="App">
                    <h1> Hello, World! </h1>
                </div>
                <Button variant="contained">this is a material UI button</Button>
            </>
        );
    }
}

export default App;