import React from 'react';
import { Divider, Grid, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { HomeState } from 'renderer/pages/home/Home';

interface ProjectCardInterface {
  projectName: string;
  projectPath: string;
}

export const ProjectCard: React.FC<ProjectCardInterface> = ({
  projectName,
  projectPath,
}) => {
  return (
    <Link
      to="/home"
      state={{ projectPath } as HomeState}
      style={{ textDecoration: 'none' }}
    >
      <Paper>
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <Typography
              sx={{ height: 1 }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize={24}
              fontWeight="bold"
            >
              {projectName.slice(0, 2).toUpperCase()}
            </Typography>
          </Grid>
          <Divider
            orientation="vertical"
            flexItem
            style={{ marginRight: '-1px' }}
          />
          <Grid item xs={10}>
            <h5>{projectName}</h5>
            <small>{projectPath}</small>
          </Grid>
        </Grid>
      </Paper>
    </Link>
  );
};
