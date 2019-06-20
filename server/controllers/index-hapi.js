import 'babel-polyfill';
import hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import path from "path";

import serverRenderer from '../middleware/renderer';
import configureStore from '../../src/store/configureStore';

const router = express.Router();

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
          path: path.join(__dirname, '../../build'),
          listing: false,
          index: false
        }
      }
  });

  server.route({
      method: 'GET',
      path:'/',
      handler: (request, reply) => {
          const context = { };
          const jsx = (
              <StaticRouter context={ context } location={ request.url }>
                  <Layout />
              </StaticRouter>
          );
          const reactDom = renderToString( jsx );
          return htmlTemplate( reactDom );
      }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

const actionIndex = (req, res, next) => {
    const store = configureStore();
    serverRenderer(store)(req, res, next);
};


// root (/) should always serve our server rendered page
router.use('^/$', actionIndex);

// other static resources should just be served as they are
router.use(express.static(
    path.resolve(__dirname, '..', '..', 'build'),
    { maxAge: '30d' },
));

// any other route should be handled by react-router, so serve the index page
router.use('*', actionIndex);


export default router;
