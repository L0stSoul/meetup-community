import env from './bundler/env';

export default class Config {
  constructor(mode, isPublic) {
    let ssl = env.get('ssl') || false;
    let host = env.get('host') || (mode === 'production' ? 'example.com' : 'localhost');
    let port = env.get('port') || (mode === 'production' ? 8080 : 3000);

    this.env = mode;
    this.host = host;
    this.port = port;
    this.ssl = ssl;
    this.url = `http${(ssl ? 's' : '')}://${host}${(mode === 'production' ? '' : ':' + port)}/`;
    this.title = 'Meetups';

    if (!isPublic) {
      this.paths = {
        backend: './backend',
        frontend: './frontend',
        universal: './unversal',
        public: './public',
        assets: './public/assets'
      };
    }
  }
};
