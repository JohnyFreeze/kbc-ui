import actions from '../components/InstalledComponentsActionCreators';
import store from '../components/stores/InstalledComponentsStore';
import template from './template';
import jobsTemplates from './jobsTemplates';
import {List, fromJS} from 'immutable';
import Promise from 'bluebird';

const COMPONENT_ID = 'ex-adform';

function JSONtoString(map) {
  return JSON.stringify(map.toJSON(), null, '  ');
}

export function saveCredentials(configId) {
  const credentials = store.getLocalState(COMPONENT_ID, configId).get('credentials');
  if (!credentials) {
    return Promise.resolve();
  }

  const config = template(store.getConfig(COMPONENT_ID, configId).get('name'),
      store.getConfigData(COMPONENT_ID, configId))
      .setIn(['parameters', 'config', 'username'], credentials.get('username'))
      .setIn(['parameters', 'config', 'password'], credentials.get('password'));

  return actions.saveComponentConfigData(COMPONENT_ID, configId, config);
}

export function cancelCredentialsEdit(configId) {
  const localState = store.getLocalState(COMPONENT_ID, configId);
  actions.updateLocalState(COMPONENT_ID, configId, localState.remove('credentials'));
}

export function jobsEditStart(configId) {
  const jobs = store.getConfigData(COMPONENT_ID, configId).getIn(['parameters', 'config', 'jobs'], List()),
    localState = store.getLocalState(COMPONENT_ID, configId);

  actions.updateLocalState(COMPONENT_ID, configId,
    localState.set('jobsString', JSONtoString(jobs)));
}

export function jobsEditCancel(configId) {
  const localState = store.getLocalState(COMPONENT_ID, configId);
  actions.updateLocalState(COMPONENT_ID, configId, localState.remove('jobsString'));
}

export function jobsEditChange(configId, newValue) {
  const localState = store.getLocalState(COMPONENT_ID, configId);
  actions.updateLocalState(COMPONENT_ID, configId, localState.set('jobsString', newValue));
}

export function jobsEditSubmit(configId) {
  const jobs = fromJS(JSON.parse(store.getLocalState(COMPONENT_ID, configId).get('jobsString'))),
    config = template(store.getConfig(COMPONENT_ID, configId).get('name'),
      store.getConfigData(COMPONENT_ID, configId))
      .setIn(['parameters', 'config', 'jobs'], jobs);

  return actions.saveComponentConfigData(COMPONENT_ID, configId, config)
    .then(() => {
      const localState = store.getLocalState(COMPONENT_ID, configId);
      actions.updateLocalState(COMPONENT_ID, configId, localState.remove('jobsString'));
    });
}

export function updateLocalState(configId, newState) {
  actions.updateLocalState(COMPONENT_ID, configId, newState);
}

export function changeTemplate(configId, newTemplateId) {
  const foundTemplate = jobsTemplates.find((tmpl) => tmpl.get('id') === newTemplateId),
    localState = store.getLocalState(COMPONENT_ID, configId);

  actions.updateLocalState(COMPONENT_ID, configId,
    localState.set('jobsString', JSONtoString(foundTemplate.get('template'))));

}