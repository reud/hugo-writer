import React, { useCallback, useEffect } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Bottom } from 'renderer/pages/settings/atoms/Bottom';
import { FilePathInputField } from 'renderer/pages/settings/components/FilePathInputField';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProjectConfigInterface } from '../../../common/interfaces';

interface SettingsState {
  projectPath: string;
}

class GenreInterface {}

interface CanSettingConfig {
  diary: Partial<GenreInterface> | null;
  article: Partial<GenreInterface> | null;
  tags: string[];
  authors: string[];
}

const Settings: React.FC<SettingsState> = ({ projectPath }) => {
  const nav = useNavigate();

  const initialProjectConfig = window.electron.openProjectConfigFile(
    projectPath
  ) as ProjectConfigInterface;

  const projectName = projectPath.split('/')[projectPath.split('/').length - 1];

  const [useDiaryState, setUseDiaryState] = React.useState(
    !!initialProjectConfig.diary
  );
  const [useArticleState, setUseArticleState] = React.useState(
    !!initialProjectConfig.article
  );
  const [diaryFolderPath, setDiaryFolderPath] = React.useState(
    initialProjectConfig.diary?.folderPath || ''
  );
  const [articleFolderPath, setArticleFolderPath] = React.useState(
    initialProjectConfig.article?.folderPath || ''
  );

  const [okButtonEnable, setOKButtonEnable] = React.useState(false);
  const [applyButtonEnable, setApplyButtonEnable] = React.useState(false);

  const [authors, setAuthors] = React.useState(initialProjectConfig.authors);
  const [tags, setTags] = React.useState(initialProjectConfig.tags);

  const [tagField, setTagField] = React.useState('');
  const [authorField, setAuthorField] = React.useState('');

  const [data, setData] =
    React.useState<CanSettingConfig>(initialProjectConfig);

  const update = (config: CanSettingConfig) => {
    if (config.article) {
      const nowArticle = window.electron.storeGet(projectPath, 'article');
      if (!nowArticle) {
        console.log('[Error] now editing article returns null');
        return;
      }
      const updated = { ...nowArticle, ...config.article };
      window.electron.storeSet(projectPath, { article: updated });
    } else window.electron.storeSet(projectPath, { article: null });

    if (config.diary) {
      const nowDiary = window.electron.storeGet(projectPath, 'diary');
      if (!nowDiary) {
        console.log('[Error] now editing diary returns null');
        return;
      }
      const updated = { ...nowDiary, ...config.diary };
      window.electron.storeSet(projectPath, { diary: updated });
    } else window.electron.storeSet(projectPath, { diary: null });

    window.electron.storeSet(projectPath, { tags });
    window.electron.storeSet(projectPath, { authors });
  };

  const checkFolderExistApi: (path: string) => boolean =
    window.electron.checkFolderExist;

  const openDiaryFolder = (defaultPath: string) => {
    return window.electron.ipcRenderer.invoke('openDiaryFolder', defaultPath);
  };

  const openArticleFolder = (defaultPath: string) => {
    return window.electron.ipcRenderer.invoke('openArticleFolder', defaultPath);
  };

  const handleUseDiaryCheckBoxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUseDiaryState(event.target.checked);
  };
  const handleUseArticleCheckBoxChange = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUseArticleState(ev.target.checked);
  };

  const diaryPathConstraint = useCallback(
    (p: string) => {
      return checkFolderExistApi(window.electron.pathJoin(projectPath, p));
    },
    [checkFolderExistApi, projectPath]
  );
  const articlePathConstraint = useCallback(
    (p: string) => {
      return checkFolderExistApi(window.electron.pathJoin(projectPath, p));
    },
    [checkFolderExistApi, projectPath]
  );

  useEffect(() => {
    let passConstraints = true;
    if (useDiaryState) {
      if (!diaryPathConstraint(diaryFolderPath)) {
        console.log('check constraint: diaryPathConstraint failed');
        passConstraints = false;
      }
    }
    if (useArticleState) {
      if (!articlePathConstraint(articleFolderPath)) {
        console.log('check constraint: articlePathConstraint failed');
        passConstraints = false;
      }
    }
    if (authors.length === 0) passConstraints = false;
    if (tags.length === 0) passConstraints = false;

    if (passConstraints) {
      setData({
        article: useArticleState ? { folderPath: articleFolderPath } : null,
        authors,
        diary: useDiaryState ? { folderPath: diaryFolderPath } : null,
        tags,
      });
    }
    setOKButtonEnable(passConstraints);
    setApplyButtonEnable(passConstraints);
  }, [
    useDiaryState,
    useArticleState,
    diaryFolderPath,
    articleFolderPath,
    tags,
    authors,
    diaryPathConstraint,
    articlePathConstraint,
  ]);

  return (
    <div id="settings">
      <Grid container direction="column" alignItems="center">
        <Grid item>
          <Typography>⚙️ {projectName} Settings</Typography>
        </Grid>
        <Grid item>
          <Typography variant="caption">
            place:{' '}
            {window.electron.pathJoin(
              projectPath,
              '.hugo-text-writer',
              'config.json'
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container direction="column" alignItems="center" spacing={3}>
        <Grid item>
          <Paper variant="outlined">
            <h3>📖Diary</h3>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  onChange={handleUseDiaryCheckBoxChange}
                />
              }
              label="UseForDiaryWriting"
            />
            <FormGroup>
              <FilePathInputField
                defaultValue={diaryFolderPath}
                onValueChanged={(v) => {
                  setDiaryFolderPath(v);
                }}
                constraint={diaryPathConstraint}
                errorString="Folder Not Found"
                label="Diary Path(ProjectRelative)"
                folderIconPushed={async () => {
                  const path = await openDiaryFolder(projectPath);
                  return path.replace(projectPath, '');
                }}
                disabled={!useDiaryState}
              />
            </FormGroup>
          </Paper>
        </Grid>
        <Grid item>
          <Paper variant="outlined">
            <h3>📚Article</h3>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked
                    onChange={handleUseArticleCheckBoxChange}
                  />
                }
                label="UseForArticleWriting"
              />
              <Grid container>
                <FilePathInputField
                  defaultValue={articleFolderPath}
                  onValueChanged={(v) => {
                    setArticleFolderPath(v);
                  }}
                  constraint={articlePathConstraint}
                  errorString="Folder Not Found"
                  label="Article Path(ProjectRelative)"
                  folderIconPushed={async () => {
                    const path = await openArticleFolder(projectPath);
                    return path.replace(projectPath, '');
                  }}
                  disabled={!useArticleState}
                />
              </Grid>
            </FormGroup>
          </Paper>
        </Grid>
        <Grid item />
      </Grid>
      <Grid
        container
        direction="row"
        alignItems="center"
        spacing={3}
        justifyContent="center"
      >
        <Grid item>
          <Paper variant="outlined">
            <h4>🔖Tags</h4>
            <Grid container>
              <TextField
                label="Add New Tag"
                variant="standard"
                value={tagField}
                onChange={(ev) => setTagField(ev.target.value)}
                id="standard-error-helper-text"
                error={tags.length === 0}
                helperText="tags can not empty"
              />
              <Button
                variant="contained"
                onClick={() => {
                  const v = [...tags];
                  v.push(tagField);
                  setTags(v);
                }}
              >
                Add
              </Button>
            </Grid>
            <List dense={false}>
              {tags.map((v, i) => {
                return (
                  <ListItem
                    key={v}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          const array = [...tags];
                          array.splice(i, 1);
                          setTags(array);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    {v}
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>
        <Grid item>
          <Paper variant="outlined">
            <h4>👨‍🦲Authors</h4>
            <Grid container>
              <TextField
                label="Add Author Tag"
                variant="standard"
                value={authorField}
                onChange={(ev) => setAuthorField(ev.target.value)}
                id="standard-error-helper-text"
                error={authors.length === 0}
                helperText="authors can not empty"
              />
              <Button
                variant="contained"
                onClick={() => {
                  const v = [...authors];
                  v.push(authorField);
                  setAuthors(v);
                }}
              >
                Add
              </Button>
            </Grid>
            <List dense={false}>
              {authors.map((v, i) => {
                return (
                  <ListItem
                    key={v}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          const array = [...authors];
                          array.splice(i, 1);
                          setAuthors(array);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    {v}
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ height: 100 }} />
      <Bottom
        OnCancelClicked={() => {
          nav('/home', { state: { projectPath } });
        }}
        OnApplyClicked={() => {
          update(data);
        }}
        OnOKClicked={() => {
          update(data);
          console.log(data);
          nav('/home', { state: { projectPath } });
        }}
        applyButtonEnable={applyButtonEnable}
        okButtonEnable={okButtonEnable}
      />
    </div>
  );
};

export const SettingsWrap: React.FC = () => {
  const location = useLocation();
  const state = location.state as SettingsState;
  if (state == null) {
    return <div />;
  }
  return Settings(state);
};
