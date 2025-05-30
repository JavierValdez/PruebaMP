import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder,
  People,
  Assessment,
  Settings,
  Gavel,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: ['ADMIN', 'FISCAL', 'SECRETARIO']
  },
  {
    text: 'Casos',
    icon: <Folder />,
    path: '/casos-lista',
    roles: ['ADMIN', 'FISCAL', 'SECRETARIO']
  },
  {
    text: 'Casos (Antiguo)',
    icon: <Folder />,
    path: '/casos',
    roles: ['ADMIN', 'FISCAL', 'SECRETARIO']
  },
  {
    text: 'Fiscales',
    icon: <People />,
    path: '/fiscales',
    roles: ['ADMIN']
  },
  {
    text: 'Informes',
    icon: <Assessment />,
    path: '/informes',
    roles: ['ADMIN', 'FISCAL']
  },
  {
    text: 'Juzgados',
    icon: <Gavel />,
    path: '/juzgados',
    roles: ['ADMIN', 'SECRETARIO']
  },
  {
    text: 'Configuración',
    icon: <Settings />,
    path: '/configuracion',
    roles: ['ADMIN']
  },
];

const drawerWidth = 240;

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  // Filtrar elementos de menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => {
    if (!state.user?.rol) return false;
    return item.roles.includes(state.user.rol.nombreRol);
  });

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          MP Sistema
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleItemClick(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {state.user && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Usuario: {state.user.nombreUsuario}
            </Typography>
            {state.user.rol && (
              <Typography variant="body2" color="text.secondary">
                Rol: {state.user.rol.nombreRol}
              </Typography>
            )}
            {state.user.fiscalia && (
              <Typography variant="body2" color="text.secondary">
                Fiscalía: {state.user.fiscalia.nombreFiscalia}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            position: 'relative',
            height: '100vh',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
