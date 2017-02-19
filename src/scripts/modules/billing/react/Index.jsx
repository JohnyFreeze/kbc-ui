import React from 'react';
import ApplicationStore from '../../../stores/ApplicationStore';
import Graph from './Graph';
import UsageByMonth from './UsageByMonth';
import ProjectPowerLimit from './ProjectPowerLimit';
import { Link } from 'react-router';

export function componentIoSummary(data, metric) {
  return data
    .reduce(function(reduction, component) {
      return reduction
        + component.get(metric).get('inBytes')
        + component.get(metric).get('outBytes');
    }, 0);
}

export default React.createClass({

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
          <li role="presentation">
            <Link to="settings-limits">Limits</Link>
          </li>
          <li role="presentation" className="active">
            <Link to="settings-project-power">Project Power</Link>
          </li>
        </ul>
        <div className="kbc-header">
          <div className="row">
            <div className="col-md-6">
              <Graph/>
              <ProjectPowerLimit/>
            </div>
            <div className="col-md-6">
              <UsageByMonth />
            </div>
          </div>
        </div>
      </div>
    );
  },

  projectPageUrl(path) {
    return ApplicationStore.getProjectPageUrl(path);
  }

});
