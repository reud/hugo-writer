import { Link } from 'react-router-dom';
import React from 'react';
import { ProjectInfoCardProps } from '../structure';

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  projectPath,
  isExist,
}) => {
  const linkClassNameBase = 'list-group-item list-group-item-action ';
  const pathes = window.electron.pathSplitBySep(projectPath);
  const label = pathes[pathes.length - 1];
  return (
    <Link
      to="/"
      state={{ projectPath, isExist } as ProjectInfoCardProps}
      className={linkClassNameBase + (!isExist ? 'disabled-link' : '')}
    >
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">{label + (!isExist ? '(does not exist)' : '')}</h5>
      </div>
      <small className="text-muted">{projectPath}</small>
    </Link>
  );
};
