import server from 'express';
import multer, { diskStorage } from 'multer';
import findFreePorts from 'find-free-ports';

export class FileServerConfig {
  private static instance: FileServerConfig;

  public port: number;

  public cwd: string;

  private constructor() {
    this.port = -1;
    this.cwd = '';
  }

  static getInstance() {
    if (!FileServerConfig.instance) {
      console.log('generating instance...');
      FileServerConfig.instance = new FileServerConfig();
    }
    return FileServerConfig.instance;
  }
}

export const expressStartApp = () => {
  const storage = diskStorage({
    destination(_req: any, _file: any, cb: any) {
      const dir = FileServerConfig.getInstance().cwd;
      console.log('dest', dir);
      if (dir === '') {
        cb(new Error('[destination error]editingDirectory is empty'), '');
      }
      cb(null, dir);
    },
    filename(req: any, file: any, cb: any) {
      (req as any).imagePath = Date.now() + file.originalname;
      cb(null, (req as any).imagePath);
    },
  });

  const upload = multer({ storage });

  const app = server();

  app.post('/upload', upload.single('image'), (req, res) => {
    res.send({
      data: {
        filePath: (req as any).imagePath,
      },
    });
  });

  findFreePorts()
    .then(([port]) => {
      FileServerConfig.getInstance().port = port;
      return app.listen(FileServerConfig.getInstance().port, () => {
        console.log(
          `app listening on port ${FileServerConfig.getInstance().port}`
        );
      });
    })
    .catch((e) => {
      throw e;
    });
};
