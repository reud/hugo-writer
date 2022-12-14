import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
// NOTE: なぜかeslintが見つけてくれないけどちゃんと動く
// eslint-disable-next-line import/named
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import dayjs from 'dayjs';
import DateTimePicker from '@mui/lab/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { WritingData } from '../../../structure';

interface Shared {
  sharedState: WritingData;
  setSharedState: React.Dispatch<React.SetStateAction<WritingData>>;
  projectPath: string;
}

export const LeftDrawer: React.FC<Shared> = ({
  sharedState,
  setSharedState,
  projectPath,
}) => {
  const defaultCategory = sharedState.category;
  const defaultWriter = sharedState.author;

  const [usingState, setUsingState] = React.useState(false);
  const [dateTimeState, setDateTimeState] = React.useState<Date | null>(null);
  const [draftState, setDraftState] = React.useState<boolean>(
    sharedState.draft
  );
  const [selectedAuthorState, setSelectedAuthorState] = React.useState<string>(
    sharedState.author
  );
  const [selectedCategoryState, setSelectedCategoryState] =
    React.useState<string>(sharedState.category[0]);

  const handleDateTimeState = (newValue: Date | null) => {
    setDateTimeState(newValue);
  };
  const handleDraftState = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraftState(event.target.checked);
  };
  const handleSelectAuthorChange = (event: SelectChangeEvent) => {
    setSelectedAuthorState(event.target.value as string);
  };
  const handleSelectCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategoryState(event.target.value as string);
  };

  const categories = window.electron.storeGet(projectPath, 'categories');
  const authors = window.electron.storeGet(projectPath, 'authors');

  useEffect(() => {
    const ds = dayjs(dateTimeState);
    console.log(ds);
    setSharedState({
      author: selectedAuthorState,
      category: [selectedCategoryState],
      datetime: ds.format('YYYY-MM-DDTHH:mm:00+09:00'),
      draft: draftState,
      folderName: sharedState.folderName,
      isContinue: false,
      path: sharedState.path,
      contentStr: sharedState.contentStr,
      title: sharedState.title,
    });
  }, [dateTimeState, draftState, selectedCategoryState, selectedAuthorState]);

  useEffect(() => {
    console.log('ini', sharedState);
    console.log('ins', sharedState.datetime);
    const d = new Date(sharedState.datetime);
    setDateTimeState(d);
  }, []);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setUsingState(open);
    };

  const content = () => (
    <Box sx={{ width: 250, m: 3 }} role="presentation">
      <Typography variant="h5" align="center" pb={3}>
        HugoText-Writer
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <List disablePadding>
          <FormGroup>
            <DateTimePicker
              label="投稿日時"
              value={dateTimeState}
              onChange={handleDateTimeState}
              renderInput={(
                params: JSX.IntrinsicAttributes & TextFieldProps
              ) => <TextField {...params} />}
            />
            <FormControlLabel
              control={
                <Checkbox checked={draftState} onChange={handleDraftState} />
              }
              label="Draft"
            />
            <InputLabel id="author-label">Author</InputLabel>
            <Select
              labelId="author-label"
              value={selectedAuthorState}
              label="Author"
              onChange={handleSelectAuthorChange}
              defaultValue={defaultWriter}
            >
              {authors.map((author) => {
                return (
                  <MenuItem value={author} key={author}>
                    {author}
                  </MenuItem>
                );
              })}
            </Select>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategoryState}
              label="category"
              onChange={handleSelectCategoryChange}
              defaultValue={defaultCategory[0]}
            >
              {categories.map((category) => {
                return (
                  <MenuItem value={category} key={category}>
                    {category}
                  </MenuItem>
                );
              })}
            </Select>
            <Box pt={3}>
              <TextField
                fullWidth
                label="Folder Place"
                disabled
                value={sharedState.folderName}
              />
            </Box>
          </FormGroup>
        </List>
      </LocalizationProvider>
    </Box>
  );

  return (
    <div>
      <React.Fragment key="drawer">
        <Button onClick={toggleDrawer(true)}>INFO</Button>
        <Drawer anchor="left" open={usingState} onClose={toggleDrawer(false)}>
          {content()}
        </Drawer>
      </React.Fragment>
    </div>
  );
};
