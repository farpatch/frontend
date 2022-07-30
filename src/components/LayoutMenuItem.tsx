import * as React from "react";
import * as ReactRouterDom from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';

import { ListItem, ListItemButton, ListItemIcon, ListItemText, SvgIconProps, Box } from "@mui/material";

import { routeMatches } from "../utils";

interface LayoutMenuItemProps {
  icon: React.ComponentType<SvgIconProps>;
  label: string;
  to: string;
  statusIdBase?: string;
  statusClassName?: string;
  disabled?: boolean;
}

const LayoutMenuItem: React.FC<LayoutMenuItemProps> = ({ icon: Icon, label, to, disabled, statusIdBase, statusClassName }) => {
  const { pathname } = ReactRouterDom.useLocation();
  var statusId = undefined;
  if (statusIdBase) {
    statusId = `${statusIdBase}-${label}`;
  }

  return (
    <ListItem disablePadding selected={routeMatches(to, pathname)} secondaryAction={
      <Box><div id={statusId} className={statusClassName} /></Box>
    }>
      <ListItemButton component={ReactRouterDom.Link} to={to} disabled={disabled}>
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText>{label}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

export default LayoutMenuItem;
