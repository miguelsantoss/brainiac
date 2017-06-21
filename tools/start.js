import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackDevServer from 'webpack-dev-server';
import webpackHotMiddleware from 'webpack-hot-middleware';
import WriteFilePlugin from 'write-file-webpack-plugin';
import nodemon from 'nodemon';
import url from 'url';
import querystring from 'querystring';
import launchEditor from 'react-dev-utils/launchEditor';
import run from './run';
import runServer from './runServer';
import webpackConfig from './webpack.config';
import clean from './clean';
import copy from './copy';

const isDebug = !process.argv.includes('--release');
process.argv.push('--watch');

const clientConfig = webpackConfig;

async function start() {
  await run(clean);
  //await run(copy);
  await new Promise((resolve) => {
    // Save the server-side bundle files to the file system after compilation
    // https://github.com/webpack/webpack-dev-server/issues/62
    // serverConfig.plugins.push(new WriteFilePlugin({ log: false }));

    const bundler = webpackDevServer(webpackConfig);

    let handleBundleComplete = async () => {
      handleBundleComplete = stats => !stats.stats[1].compilation.errors.length && runServer();

      const server = await runServer();
      const bs = browserSync.create();

      bs.init({
        ...isDebug ? {} : { notify: false, ui: false },

        proxy: {
          target: server.host,
          middleware: [
            {
              // Keep this in sync with react-error-overlay
              route: '/__open-stack-frame-in-editor',
              handle(req, res) {
                const query = querystring.parse(url.parse(req.url).query);
                launchEditor(query.fileName, query.lineNumber);
                res.end();
              },
            },
            wpMiddleware,
            hotMiddleware,
          ],
          proxyOptions: {
            xfwd: true,
          },
        },
      }, resolve);
    };

    bundler.plugin('done', stats => handleBundleComplete(stats));
  });
}

export default start;