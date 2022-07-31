import React from 'react';
import { Link } from 'react-router-dom';
import './infoCard.css';
import { EditState, InfoCardProps } from '../structure';

export const InfoCard: React.FC<InfoCardProps> = ({
  label,
  savePlace,
  disabled,
  projectPath,
  writingData,
}) => {
  const linkClassNameBase = 'list-group-item list-group-item-action ';
  return (
    <Link
      to="/edit"
      state={{ projectPath, writingData } as EditState}
      className={linkClassNameBase + (disabled ? 'disabled-link' : '')}
    >
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">
          {label + (disabled ? '(ファイルが既に存在しています)' : '')}
        </h5>
      </div>
      <p className="mb-1">保存先:</p>
      <small className="text-muted">{savePlace}</small>
    </Link>
  );
};
