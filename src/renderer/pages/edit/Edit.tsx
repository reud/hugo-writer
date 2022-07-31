import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LeftDrawer } from 'renderer/pages/edit/atoms/LeftDrawer';
import {
  Button,
  FormControl,
  FormGroup,
  Input,
  InputAdornment,
  InputLabel,
  List,
} from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SimpleMdeReact from 'react-simplemde-editor';

import 'easymde/dist/easymde.min.css';
import { EditState, FrontMatter, WritingData } from '../../structure';

const Edit: React.FC = () => {
  const location = useLocation();
  const state = location.state as EditState;
  console.log('state: ', state);
  const { projectPath } = state;
  const [shellInputState, setShellInputState] = useState('');
  const [shellOutState, setShellOutState] = useState('');
  const [sharedState, setSharedState] = useState<WritingData>(
    state.writingData
  );
  // 何故かsharedStateだと上手くいかないのでタイトル部分だけ外に出す。
  const [titleState, setTitleState] = useState<string>(state.writingData.title);
  const [saveLoadingState, setSaveLoadingState] = useState<boolean>(false);
  const [port, setPort] = useState(0);

  const handleContentChange = (v: string) => {
    const s = sharedState;
    s.contentStr = v;
    setSharedState(s);
  };

  const handleArticleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTitleState(event.target.value);
    const s = sharedState;
    s.title = event.target.value;
    setSharedState(s);
  };
  const handleShellInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShellInputState(event.target.value);
  };

  const saveWork = () => {
    setSaveLoadingState(true);
    console.log('projectPath', state.projectPath);
    console.log('writingData.path', state.writingData.path);
    console.log('folderName', state.writingData.folderName);
    const folderPath = window.electron.pathJoin(
      state.projectPath,
      state.writingData.path,
      state.writingData.folderName
    );
    const fileGenerator = window.electron.newFileGenerator(
      state.writingData.isContinue,
      folderPath,
      ''
    );
    const work = () => {
      return new Promise((resolve) => {
        // front matter作成
        const frontMatter: FrontMatter = {
          title: sharedState.title,
          date: sharedState.datetime,
          author: sharedState.author,
          categories: sharedState.category,
          libraries: ['mathjax'],
          draft: sharedState.draft,
        };
        // front matterが付いたmdを作成
        const merged = window.electron.frontMatterMerge(
          frontMatter,
          sharedState.contentStr
        );
        console.log(merged);
        // 保存
        fileGenerator.save(merged);
        resolve(true);
      });
    };
    work()
      .then(() => {
        return setSaveLoadingState(false);
      })
      .catch((e: Error) => {
        throw e;
      });
  };

  useEffect(() => {
    const shellOutEl = document.getElementById('outlined-multiline-static');
    if (!shellOutEl) return;
    shellOutEl.scrollTop = shellOutEl.scrollHeight;
  }, []);

  useEffect(() => {
    window.electron
      .getFileServerPort()
      .then((serverPort) => {
        if (serverPort === -1)
          throw new Error('file server does not initialized');
        setPort(serverPort);
        const folderPath = window.electron.pathJoin(
          state.projectPath,
          state.writingData.path,
          state.writingData.folderName
        );
        const p = window.electron.pathJoin(folderPath, 'index.md');
        window.electron.pushRecentlyData(state.projectPath, p);
        saveWork();

        console.log('cwd path', folderPath);
        window.electron.setCwd(folderPath);

        const ss = sharedState;
        ss.isContinue = true;
        return setSharedState(ss);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const easymdeOptions = useMemo(() => {
    console.log('fileurl', `http://localhost:${port}/upload`);
    return {
      uploadImage: true,
      imageMaxSize: 1024 * 1024 * 10,
      imageUploadEndpoint: `http://localhost:${port}/upload`,
      imagePathAbsolute: true,
      spellChecker: false,
      renderingConfig: {
        markedOptions: {
          baseUrl: `file://${
            state.projectPath +
            state.writingData.path +
            state.writingData.folderName
          }/`,
        },
      },
    };
  }, [port]);

  return (
    <div id="edit">
      <List disablePadding>
        <FormGroup>
          <LeftDrawer {...{ sharedState, setSharedState, projectPath }} />
          <Box pt={3}>
            <TextField
              fullWidth
              label="記事タイトル"
              value={titleState}
              onChange={handleArticleTitleChange}
            />
          </Box>
          <SimpleMdeReact
            options={easymdeOptions}
            value={sharedState.contentStr}
            onChange={handleContentChange}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={saveLoadingState}
            onClick={saveWork}
          >
            Save
          </Button>
          <Box p={3}>
            <TextField
              id="outlined-multiline-static"
              label="shellOutput"
              multiline
              rows={12}
              disabled
              fullWidth
              value={shellOutState}
              inputProps={{ style: { fontSize: 12 } }}
            />
          </Box>
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel htmlFor="standard-adornment-amount">Shell</InputLabel>
            <Input
              id="standard-adornment-amount"
              value={shellInputState}
              onChange={handleShellInputChange}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  const folderPath = window.electron.pathJoin(
                    state.projectPath,
                    state.writingData.path,
                    state.writingData.folderName
                  );
                  const output = window.electron.exec(
                    shellInputState,
                    folderPath
                  );
                  setShellOutState(
                    `${shellOutState}ｷﾀ━(ﾟ∀ﾟ)━! > ${shellInputState}\n` +
                      `${output}\n`
                  );
                  setShellInputState('');
                }
              }}
              startAdornment={
                <InputAdornment position="start">
                  {'ｷﾀ━(ﾟ∀ﾟ)━! >'}
                </InputAdornment>
              }
            />
            <p>{JSON.stringify(sharedState)}</p>
          </FormControl>
        </FormGroup>
      </List>
    </div>
  );
};

export default Edit;
