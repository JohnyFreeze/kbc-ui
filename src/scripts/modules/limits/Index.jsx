import React from 'react';
import ApplicationStore from '../../stores/ApplicationStore';
import createStoreMixin from '../../react/mixins/createStoreMixin';
import LimitsSection from './LimitsSection';
import StorageApi from '../components/StorageApi';
import Keen from 'keen-js';
import { Link } from 'react-router';

export default React.createClass({
  mixins: [createStoreMixin(ApplicationStore)],

  getInitialState() {
    return {
      client: null,
      isKeenReady: false
    };
  },

  componentDidMount() {
    StorageApi
      .getKeenCredentials()
      .then((response) => {
        const client = new Keen({
          readKey: response.keenToken,
          projectId: response.projectId
        });
        this.setState({
          client: client
        });
        Keen.ready(this.keenReady);
      });
  },

  getStateFromStores() {
    return {
      sections: ApplicationStore.getLimits(),
      canEdit: ApplicationStore.getKbcVars().get('canEditProjectLimits')
    };
  },

  render() {
    return (
      <div className="container-fluid kbc-main-content">
        <ul className="nav nav-tabs">
          <li role="presentation">
            <a href={this.projectPageUrl('settings-users')}>Users</a>
          </li>
          <li role="presentation">
            <a href={this.projectPageUrl('settings')}>Settings</a>
          </li>
          <li role="presentation" className="active">
            <Link to="settings-limits">Limits</Link>
          </li>
          <li role="presentation">
            <Link to="settings-project-power">Project Power</Link>
          </li>
        </ul>
        {this.state.sections.map((section) => {
          return React.createElement(LimitsSection, {
            section: section,
            keenClient: this.state.client,
            isKeenReady: this.state.isKeenReady,
            canEdit: this.state.canEdit
          });
        }, this)}
      </div>
    );
  },

  projectPageUrl(path) {
    return ApplicationStore.getProjectPageUrl(path);
  },

  keenReady() {
    this.setState({
      isKeenReady: true
    });
  }

});
