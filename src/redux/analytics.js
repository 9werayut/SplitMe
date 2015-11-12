import actionTypes from 'redux/actionTypes';
import pluginAnalytics from 'plugin/analytics';

function getPath(state) {
  return state.get('router').routes.reduce((path, route) => {
    if (route.path) {
      path += route.path;
    }

    return path;
  }, '');
}

function analytics(store) {
  return next => action => {
    const result = next(action);

    if (action && (action.type === actionTypes.ROUTER_HISTORY_API
      || action.type === actionTypes.ROUTER_REPLACE_ROUTES)) {
      pluginAnalytics.trackView(getPath(store.getState()));
    }

    return result;
  };
}

export default analytics;