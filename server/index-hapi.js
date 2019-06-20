import 'babel-polyfill';
import hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import path from "path";
import Loadable from 'react-loadable';

import serverRenderer from './middleware/renderer';
import configureStore from '../src/store/configureStore';

const init = async () => {
    
  const server = hapi.server({
      port: 1030,
      host: 'localhost'
  });

  await server.register(Inert);

  // Serve static files
  server.route({
      method: 'GET',
      path: '/{filepath*}',
      config: {
        auth: false,
      //   cache: {
      //     expiresIn: 24 * 60 * 60 * 1000,
      //     privacy: 'public'
      //   }
      },
      handler: {
        directory: {
          path: path.join(__dirname, '../build'),
          listing: false,
          index: false
        }
      }
  });

  server.route({
      method: 'GET',
      path:'/',
      handler: async (request, reply) => {
        const store = configureStore();
        const htmlToRender = await serverRenderer(store)(request, reply);
        if(!htmlToRender){
          console.log('Error occured!');
        }
        return htmlToRender
      }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
  
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

Loadable.preloadAll().then(() => {
  init();
});
