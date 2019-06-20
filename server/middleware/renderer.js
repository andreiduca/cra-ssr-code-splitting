import 'babel-polyfill';
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Loadable from 'react-loadable';
import { Provider as ReduxProvider } from 'react-redux'
import { StaticRouter } from 'react-router';
import { Helmet } from 'react-helmet';

// import our main App component
import App from '../../src/App.jsx';

// import the manifest generated with the create-react-app build
import manifest from '../../build/asset-manifest.json';
// function to extract js assets from the manifest
const extractAssets = (assets, chunks) => Object.keys(assets)
    .filter(asset => chunks.indexOf(asset.replace('.js', '')) > -1)
    .map(k => assets[k]);


const path = require("path");
const fs = require("fs");


export default (store) => async (req, res) => {
    // get the html file created with the create-react-app build
    const filePath = await path.resolve(__dirname, '..', '..', 'build', 'index.html');
    // console.log(`error logged! ${filePath}`);

    const htmlContext = await fs.readFileSync(filePath, 'utf8');
    const modules = [];
    const routerContext = {};

    if (htmlContext instanceof Error) {
      return htmlContext;
    }

    // render the app as a string
    const html = await ReactDOMServer.renderToString(
        <Loadable.Capture report={m => modules.push(m)}>
            <ReduxProvider store={store}>
                <StaticRouter location={req.baseUrl} context={routerContext}>
                    <App/>
                </StaticRouter>
            </ReduxProvider>
        </Loadable.Capture>
    );

    // get the stringified state
    const reduxState = await JSON.stringify(store.getState());

    // map required assets to script tags
    const extraChunks = await extractAssets(manifest, modules)
        .map(c => `<script type="text/javascript" src="/${c}"></script>`);

    // get HTML headers
    const helmet = await Helmet.renderStatic();

    // now inject the rendered app into our html and send it to the client
    return htmlContext
            // write the React app
            .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
            // write the string version of our state
            .replace('__REDUX_STATE__={}', `__REDUX_STATE__=${reduxState}`)
            // append the extra js assets
            .replace('</body>', extraChunks.join('') + '</body>')
            // write the HTML header tags
            .replace('<title></title>', helmet.title.toString() + helmet.meta.toString());
}
