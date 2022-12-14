import Drawer from '@mui/material/Drawer';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  styled,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { HomeState } from 'renderer/pages/home/Home';
import { ProjectCard } from 'renderer/pages/top/components/ProjectCard';
import SettingsIcon from '@mui/icons-material/Settings';
import { pickRandomEmoji } from '../../util';
import packageJson from '../../../../package.json';

const BottomButton = styled(IconButton)({
  bottom: 1.0,
  left: 0,
  position: 'absolute',
});

export const Top: React.FC = () => {
  const nav = useNavigate();
  const [recentlyProjects, setRecentlyProjects] = useState<string[]>([]);

  const openProject = async () => {
    const path = await window.electron.ipcRenderer.invoke('openProject');
    if (path === '') return;
    console.log('path', path);
    window.electron.pushRecentlyOpenProject(path);
    const state: HomeState = { projectPath: path };
    nav('/home', {
      state,
    });
  };

  useEffect(() => {
    setRecentlyProjects(window.electron.pullRecentlyOpenProject());
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        anchor="left"
        variant="permanent"
        PaperProps={{
          sx: {
            width: 240,
            backgroundColor: '#FBFBFB',
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          },
        }}
      >
        <Box
          sx={{
            width: 200,
            m: 3,
          }}
        >
          <Grid container columnSpacing={3}>
            <Grid item>
              <Box sx={{ fontSize: 32 }}>{pickRandomEmoji()}</Box>
            </Grid>
            <Grid item>
              <Typography sx={{ fontWeight: 'bold' }}>
                Hugo Text Writer
              </Typography>
              <Typography variant="caption">
                version {packageJson.version}
              </Typography>
            </Grid>
          </Grid>
          <Button
            sx={{ mt: 5, width: 200 }}
            variant="outlined"
            size="medium"
            onClick={openProject}
          >
            Open
          </Button>
        </Box>
        <BottomButton size="medium">
          <SettingsIcon fontSize="medium" />
        </BottomButton>
      </Drawer>
      <Box component="main" sx={{ p: 3, ml: 30, mr: 1, width: 1 }}>
        {recentlyProjects.map((p) => {
          const splitted = window.electron.pathSplitBySep(p);
          const projectName = splitted[splitted.length - 1];
          return (
            <ProjectCard projectName={projectName} projectPath={p} key={p} />
          );
        })}
      </Box>
    </Box>
  );
};
