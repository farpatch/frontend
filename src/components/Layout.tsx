
import * as React from 'react';
import * as ReactRouterDom from 'react-router-dom';

import { Box, Toolbar } from '@mui/material';

import { PROJECT_NAME } from '../utils/env';
import { RequiredChildrenProps } from '../utils';

import LayoutDrawer from './LayoutDrawer';
import LayoutAppBar from './LayoutAppBar';
import { LayoutContext } from './context';
import useAppBarHeight from '../utils/use-app-bar-height';

export const DRAWER_WIDTH = 280;

const Layout: React.FC<RequiredChildrenProps> = ({ children }) => {

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [title, setTitle] = React.useState(PROJECT_NAME);
  const { pathname } = ReactRouterDom.useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <LayoutContext.Provider value={{ title, setTitle }}>
      <LayoutAppBar title={title} onToggleDrawer={handleDrawerToggle} />
      <LayoutDrawer mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{ marginLeft: { md: `${DRAWER_WIDTH}px` } }}
      >
        <Toolbar />
        <Box height={"calc(100vh - " + useAppBarHeight() + "px)"}>
          {children}
        </Box>
      </Box>
    </LayoutContext.Provider >
  );

};

export default Layout;
