import React from 'react';
import { Router } from 'dva/router';

import App from './routes/App/app';
import firebaseApp from './firebase';

const cached = {};
const registerModel = (app, model) => {
    if (!cached[model.namespace]) {
        app.model(model);
        cached[model.namespace] = 1;
    }
};

const RouterConfig = ({ history, app }) => {
    const requireAuth = (nextState, replace, callback) => {
        const user = firebaseApp.auth().currentUser;
        if (!user) {
            app._store.dispatch({
                type: 'app/redirectToLogin',
                payload: { attemptedUrl: nextState.location.pathname }
            });
        } else {
            callback();
        }
    };

    const routes = [
        // app
        {
            path: '/',
            component: App,
            onEnter: requireAuth,
            getIndexRoute(nextState, callback) {
                require.ensure([], (require) => {
                    callback(null, {
                        component: require('./routes/IndexPage/index')
                    });
                });
            },
            childRoutes: [
                {
                    path: 'users',
                    getComponent(nextState, callback) {
                        require.ensure([], (require) => {
                            callback(null, require('./routes/Contents/users/users'));
                        });
                    }
                }
            ]
        },
        // login
        {
            path: 'login',
            name: 'login',
            getComponent(nextState, callback) {
                require.ensure([], (require) => {
                    registerModel(app, require('./models/login'));
                    callback(null, require('./routes/Login/login'));
                });
            }
        },
        // Register
        {
            path: 'register',
            name: 'register',
            getComponent(nextState, callback) {
                require.ensure([], (require) => {
                    registerModel(app, require('./models/register'));
                    callback(null, require('./routes/Register/register'));
                });
            }
        },
        {
            path: 'reset',
            name: 'reset',
            getComponent(nextState, callback) {
                require.ensure([], (require) => {
                    registerModel(app, require('./models/reset'));
                    callback(null, require('./routes/Reset/reset'));
                });
            }
        },
        // error
        {
            path: '*',
            name: 'error',
            getComponent(nextState, callback) {
                require.ensure([], (require) => {
                    callback(null, require('./routes/Error/error'));
                });
            }
        }
    ];
    return (
        <Router history={history} routes={routes} />
    );
};

export default RouterConfig;
