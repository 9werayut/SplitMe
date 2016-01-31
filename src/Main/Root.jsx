import React from 'react';
import {Provider} from 'react-redux';
import {Router} from 'react-router';
import {
  createStore,
  applyMiddleware,
  compose,
} from 'redux';
import {syncHistory} from 'redux-simple-router';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';

let createHistory;

if (process.env.PLATFORM === 'android') {
  createHistory = require('history/lib/createMemoryHistory');
} else {
  createHistory = require('history/lib/createBrowserHistory');
}

import locale from 'locale';
import routes from 'Main/routes';
import facebookActions from 'Main/Facebook/actions';
import reducers from 'redux/reducers';
import crashMiddleware from 'redux/crashMiddleware';
import loggerMiddleware from 'redux/loggerMiddleware';

require('Main/main.less');

const history = createHistory();

window.tests = {
  history: history,
};

// Sync dispatched route actions to the history
const reduxRouterMiddleware = syncHistory(history);

let middleware;

if (process.env.NODE_ENV === 'development') {
  middleware = applyMiddleware(
    promiseMiddleware,
    thunk,
    reduxRouterMiddleware,
    // analyticsMiddleware,
    loggerMiddleware
  );
} else {
  middleware = applyMiddleware(
    promiseMiddleware,
    crashMiddleware,
    thunk,
    reduxRouterMiddleware,
    // analyticsMiddleware
  );
}

const store = compose(
  middleware,
)(createStore)(reducers);

// Sync store to history
reduxRouterMiddleware.listenForReplays(store, (state) => state.get('routing'));

// To run the tests
window.store = store;

class Root extends React.Component {
  static propTypes = {
    locale: React.PropTypes.string,
    router: React.PropTypes.object,
  };

  componentWillMount() {
    locale.setCurrent(this.props.locale);
  }

  componentDidMount() {
    // Do less at the start
    setTimeout(() => {
      store.dispatch(facebookActions.updateLoginStatus());
    }, 200);
  }

  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          {routes}
        </Router>
      </Provider>
    );
  }
}

export default Root;
