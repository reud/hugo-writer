import React, { useEffect, useState } from 'react';
import { InfoCard } from 'renderer/components/infoCard';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { randomString } from '../../util';
import {
  InfoCardProps,
  RecentDataset,
  WritingData,
  WritingDataSettings,
} from '../../structure';

export interface HomeState {
  projectPath: string;
}

const replaceSpecialItems = (obj: any) => {
  const keys = Object.keys(obj);
  const today = dayjs(new Date());
  const yesterday = today.subtract(1, 'd');
  // eslint-disable-next-line @typescript-eslint/ban-types
  const ret: { [s: string]: string } = { ...(obj as {}) };
  keys.forEach((k: string) => {
    // skip string[] variable
    if (k === 'category') return;
    ret[k] = ret[k].replaceAll(
      '<TODAY_DATETIME>',
      today.format('YYYY-MM-DDTHH:mm:00+09:00')
    );
    ret[k] = ret[k].replaceAll('<TODAY_DATE>', today.format('YYYY/MM/DD'));
    ret[k] = ret[k].replaceAll(
      '<YESTERDAY_DATETIME>',
      yesterday.format('YYYY-MM-DDTHH:mm:00+09:00')
    );
    ret[k] = ret[k].replaceAll(
      '<YESTERDAY_DATE>',
      yesterday.format('YYYY/MM/DD')
    );
    ret[k] = ret[k].replaceAll('<TODAY_DATE8D>', today.format('YYYYMMDD'));
    ret[k] = ret[k].replaceAll(
      '<YESTERDAY_DATE8D>',
      yesterday.format('YYYYMMDD')
    );
    ret[k] = ret[k].replaceAll('<RANDOM_STR>', randomString());
  });
  return ret;
};

const Home: React.FC = () => {
  const location = useLocation();
  const state = location.state as HomeState;

  const projectConfigs = window.electron.openProjectConfigFile(
    state.projectPath
  );
  const [diary, setDiary] = useState<InfoCardProps | null>(null);
  const [yesterdayDiary, setYesterdayDiary] = useState<InfoCardProps | null>(
    null
  );
  const [article, setArticle] = useState<InfoCardProps | null>(null);

  console.log('projectConfig: ', projectConfigs);
  const nav = useNavigate();

  // initiate
  useEffect(() => {
    // diaryが有効なら
    if (projectConfigs.diary) {
      const yesterdayDiaryWritingDataSettings = replaceSpecialItems({
        author: projectConfigs.authors[0],
        category: projectConfigs.diary.category,
        datetime: projectConfigs.diary.datetime.replace('<TODAY', '<YESTERDAY'),
        folderName: projectConfigs.diary.folderName.replace(
          '<TODAY',
          '<YESTERDAY'
        ),
        path: projectConfigs.diary.folderPath,
        contentStr: window.electron
          .openDiaryTemplate(state.projectPath)
          .replace('<TODAY', '<YESTERDAY'),
        title: projectConfigs.diary.title.replace('<TODAY', '<YESTERDAY'),
      }) as any as WritingDataSettings;

      const diaryWritingDataSettings = replaceSpecialItems({
        author: projectConfigs.authors[0],
        category: projectConfigs.diary.category,
        datetime: projectConfigs.diary.datetime,
        folderName: projectConfigs.diary.folderName,
        path: projectConfigs.diary.folderPath,
        contentStr: window.electron.openDiaryTemplate(state.projectPath),
        title: projectConfigs.diary.title,
      }) as any as WritingDataSettings;

      const diarySavePlace = `${state.projectPath}/${diaryWritingDataSettings.path}${diaryWritingDataSettings.folderName}/index.md`;
      const diaryInfoCard: InfoCardProps = {
        writingData: {
          ...diaryWritingDataSettings,
          draft: false,
          isContinue: window.electron.checkFileExist(diarySavePlace),
        },
        projectPath: state.projectPath,
        label: '日記を書く',
        savePlace: diarySavePlace,
        disabled: window.electron.checkFileExist(diarySavePlace),
      };

      const yesterdayDiaryPlace = `${state.projectPath}/${yesterdayDiaryWritingDataSettings.path}${yesterdayDiaryWritingDataSettings.folderName}/index.md`;
      const yesterdayDiaryInfoCard: InfoCardProps = {
        writingData: {
          ...yesterdayDiaryWritingDataSettings,
          draft: false,
          isContinue: window.electron.checkFileExist(diarySavePlace),
        },
        projectPath: state.projectPath,
        label: '昨日の日記を書く',
        savePlace: yesterdayDiaryPlace,
        disabled: window.electron.checkFileExist(yesterdayDiaryPlace),
      };

      // change state
      setDiary(diaryInfoCard);
      setYesterdayDiary(yesterdayDiaryInfoCard);
    }

    if (projectConfigs.article) {
      const articleWritingDataSettings = replaceSpecialItems({
        author: projectConfigs.authors[0],
        category: projectConfigs.article.category,
        datetime: projectConfigs.article.datetime,
        folderName: projectConfigs.article.folderName,
        path: projectConfigs.article.folderPath,
        templateStr: window.electron.openArticleTemplate(state.projectPath),
        title: projectConfigs.article.title,
      }) as any as WritingDataSettings;

      const articlePlace = `${state.projectPath}/${articleWritingDataSettings.path}${articleWritingDataSettings.folderName}/index.md`;
      const articleInfoCard: InfoCardProps = {
        writingData: {
          ...articleWritingDataSettings,
          draft: false,
          isContinue: window.electron.checkFileExist(articlePlace),
        },
        projectPath: state.projectPath,
        label: '記事を書く',
        savePlace: articlePlace,
        disabled: window.electron.checkFileExist(articlePlace),
      };

      setArticle(articleInfoCard);
    }
  }, []);

  const recentlyDataset = window.electron.genRecentlyDataset(
    state.projectPath
  ) as RecentDataset[];
  const recentlyDatasetProps = recentlyDataset.reverse().map((ds) => {
    const wd = window.electron.readFileAndParse(
      state.projectPath,
      ds.place.replace(state.projectPath, '')
    ) as WritingData;
    const infoCard: InfoCardProps = {
      writingData: wd,
      projectPath: state.projectPath,
      label: ds.title,
      savePlace: ds.place,
      disabled: false,
    };
    infoCard.writingData.isContinue = true;
    return infoCard;
  });

  const openFolder = () => {
    window.electron.ipcRenderer
      .invoke('openFolder', state.projectPath)
      .then((path: any) => {
        console.log('readPath: ', path);
        const relativeFilePath = window.electron.pathJoin(
          path.replace(state.projectPath, ''),
          'index.md'
        );
        console.log('relativeFilePath: ', relativeFilePath);
        const wd = window.electron.readFileAndParse(
          state.projectPath,
          relativeFilePath
        );
        console.log('wd: ', wd);
        return nav('/edit', {
          state: {
            projectPath: state.projectPath,
            writingData: wd,
          },
        });
      })
      .catch((err: any) => {
        alert(err);
      });
  };

  return (
    <div id="home">
      <Typography variant="h2" align="center" pb={3}>
        HUGO TEXT WRITER
      </Typography>
      <Button onClick={openFolder}>Open Folder</Button>
      <Button
        onClick={() => {
          nav('/settings', { state: { projectPath: state.projectPath } });
        }}
      >
        Config
      </Button>
      <div className="my-basic-content">
        <div className="card my-card">
          <div className="card-header">
            <h5 className="mb-1">New Content</h5>
          </div>
          <div className="list-group">
            {!!diary && <InfoCard {...diary} />}
            {!!yesterdayDiary && <InfoCard {...yesterdayDiary} />}
            {!!article && <InfoCard {...article} />}
          </div>
        </div>
        <div className="my-card">
          <div className="card-header">
            <h5 className="mb-1">Recently Opened</h5>
          </div>
          <div className="list-group" id="open-recent">
            {recentlyDatasetProps.map((prop) => {
              return <InfoCard {...prop} key={prop.savePlace} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
