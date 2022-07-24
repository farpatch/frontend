import * as React from 'react';

import { List } from '@mui/material';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';

import { PROJECT_PATH } from '../utils/env';
import LayoutMenuItem from '../components/LayoutMenuItem';

const ProjectMenu: React.FC = () => (
  <List>
    <LayoutMenuItem icon={SettingsRemoteIcon} label="Demo Project" to={`/${PROJECT_PATH}/demo`} />
  </List>
);

export default ProjectMenu;
