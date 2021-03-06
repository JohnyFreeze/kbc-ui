import Index from './react/Index/Index';
import QueryDetail from './react/QueryDetail/QueryDetail';
import QueryDetailHeaderButtons from './react/components/HeaderButtons';
import NewQuery from './react/NewQuery/NewQuery';
import NewQueryHeaderButtons from './react/NewQuery/HeaderButtons';

import store from './storeProvisioning';

import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import * as oauthUtils from '../oauth-v2/OauthUtils';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import storageActions from '../components/StorageActionCreators';

const ROUTE_PREFIX = 'ex-db-generic-';
const COMPONENT_ID = 'keboola.ex-google-bigquery';

export default {
  name: COMPONENT_ID,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  title: (routerState) => {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig(COMPONENT_ID, configId).get('name');
  },
  // headerButtonsHandler: HeaderButtons,
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(COMPONENT_ID, params.config).then(() => {
      return oauthUtils.loadCredentialsFromConfig(COMPONENT_ID, params.config);
    }),
    (params) => versionsActions.loadVersions(COMPONENT_ID, params.config),
    () => storageActions.loadTables()
  ],
  poll: {
    interval: 7,
    action: (params) => jobsActionCreators.loadComponentConfigurationLatestJobs(COMPONENT_ID, params.config)
  },
  childRoutes: [
    oauthUtils.createRedirectRouteSimple(COMPONENT_ID),
    {
      name: ROUTE_PREFIX + COMPONENT_ID + '-query',
      path: 'query/:query',
      handler: QueryDetail,
      headerButtonsHandler: QueryDetailHeaderButtons,
      title: (routerState) => {
        const configId = routerState.getIn(['params', 'config']);
        const query = routerState.getIn(['params', 'query']);
        return store(configId).getConfigQuery(query).get('name');
      }
    },
    {
      name: ROUTE_PREFIX + COMPONENT_ID + '-new-query',
      path: 'new-query',
      handler: NewQuery,
      headerButtonsHandler: NewQueryHeaderButtons,
      title: () => 'New query'
    }
  ]
};
