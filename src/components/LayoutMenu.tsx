import * as React from 'react';

import { Divider, List } from '@mui/material';

import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import WifiIcon from '@mui/icons-material/Wifi';
import TerminalIcon from '@mui/icons-material/Terminal';
import CableIcon from '@mui/icons-material/Cable';
import PestControlIcon from '@mui/icons-material/PestControl';

import { FeaturesContext } from '../contexts/features';
import { AuthenticatedContext } from '../contexts/authentication';
import ProjectMenu from '../project/ProjectMenu';
import LayoutMenuItem from './LayoutMenuItem';

const LayoutMenu: React.FC = () => {
  const { features } = React.useContext(FeaturesContext);
  const authenticatedContext = React.useContext(AuthenticatedContext);

  return (
    <>
      {/* {features.project && (
        <List disablePadding component="nav">
          <ProjectMenu />
          <Divider />
        </List>
      )} */}
      <List disablePadding component="nav">
        <LayoutMenuItem icon={CableIcon} label="Serial" to="/serial" statusIdBase='connection-status' statusClassName='connection-status' />
        <LayoutMenuItem icon={TerminalIcon} label="RTT" to="/rtt" statusIdBase='connection-status' statusClassName='connection-status' />
        <LayoutMenuItem icon={PestControlIcon} label="Debug" to="/debug" statusIdBase='connection-status' statusClassName='connection-status' />
        <LayoutMenuItem icon={WifiIcon} label="WiFi Connection" to="/wifi" />
        <LayoutMenuItem icon={SettingsInputAntennaIcon} label="Access Point" to="/ap" />
        {/* {features.ntp && (
          <LayoutMenuItem icon={AccessTimeIcon} label="Network Time" to="/ntp" />
        )}
        {features.mqtt && (
          <LayoutMenuItem icon={DeviceHubIcon} label="MQTT" to="/mqtt" />
        )}
        {features.security && (
          <LayoutMenuItem icon={LockIcon} label="Security" to="/security" disabled={!authenticatedContext.me.admin} />
        )} */}
        <LayoutMenuItem icon={SettingsIcon} label="System" to="/system" />
      </List>
    </>
  );
};

export default LayoutMenu;
