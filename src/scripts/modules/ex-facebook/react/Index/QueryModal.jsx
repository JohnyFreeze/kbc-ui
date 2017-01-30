import React, {PropTypes} from 'react';
import {Map} from 'immutable';
import {Modal, Input} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TemplateSelector from './TemplateSelector';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
// import {Loader} from 'kbc-react-components';
// import SearchRow from '../../../../react/common/SearchRow';
// import {ListGroup, ListGroupItem} from 'react-bootstrap';

// import EmptyState from '../../../components/react/components/ComponentEmptyState';

const NAME_HELP = 'Helps describing the query and also used to prefix output tables resulting from the query. Can be empty';
const ENDPOINT_HELP = 'Url part of Facebook Graph api request specifying node-id and/or edge-name, e.g. feed, me/photos etc. Can be empty.';
const FIELDS_HELP = 'Parameter of Facebook Graph api nested request specifying fields and/or additional parameters of the endpoint';
const SINCE_HELP = 'Parameter of Facebook graph api nested request. Applies only if endpoint parameter is given and specifies the date since data of the given endpoint will be retrieved. Can by specified absolutely(yyyy-mm-dd) or relatively(e.g. 15 days ago)';
const UNTIL_HELP = 'Parameter of Facebook graph api nested request. Applies only if endpoint parameter is given and specifies the date until data of the given endpoint will be retrieved. Can by specified absolutely(yyyy-mm-dd) or relatively(e.g. 15 days ago)';
const LIMIT_HELP = 'Parameter of Facebook graph api nested request. Specifies size of data returned in one page of the request. Maximum is 100, default 25.';


export default React.createClass({

  propTypes: {
    accounts: PropTypes.object.isRequired,
    queryTemplates: PropTypes.object.isRequired,
    syncAccounts: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    isSavingFn: PropTypes.func.isRequired,
    onHideFn: PropTypes.func,
    authorizedDescription: PropTypes.string,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    onSaveQuery: PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.props.onHideFn}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {this.localState(['currentQuery', 'name'], false) ? 'Edit' : 'New'} Query
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-horizontal clearfix">
            {this.renderHelpRow()}
            {this.renderInput('Name', 'name', NAME_HELP)}
            {this.renderInput('Endpoint', ['query', 'path'], ENDPOINT_HELP)}
            {this.renderFieldsInput()}
            {this.renderAccountSelector()}
            {this.renderAdvancedPart()}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSavingFn(this.query('id'))}
            onSave={this.handleSave}
            onCancel={this.props.onHideFn}
            placement="right"
            saveLabel="Save Query"
            isDisabled={this.query(null, Map()).equals(this.localState('currentQuery'))}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  renderAdvancedPart() {
    const firstShow = !this.props.localState.has('showAdvanced') &&
                          (this.query(['query', 'since']) || this.query(['query', 'until']) || this.query(['query', 'limit']) !== '25');

    const showAdvanced = this.localState(['showAdvanced'], firstShow);
    const clName = 'form-control';
    const sinceControl = this.renderInputControl(['query', 'since'], clName, SINCE_HELP);
    const untilControl = this.renderInputControl(['query', 'until'], clName, UNTIL_HELP);
    const limitControl = this.renderInputControl(['query', 'limit'], clName, LIMIT_HELP);

    const result = (
      <div className="form-group">
        <div className="col-xs-12 checkbox" >
          <label>
            <input
              checked={showAdvanced}
              type="checkbox"
              onChange={() => this.updateLocalState(['showAdvanced'], !showAdvanced)}/>
            Advanced
          </label>
        </div>
        {showAdvanced ?
         <span>
           <label className="col-xs-2 control-label">
             Since
             {this.renderTooltipHelp(SINCE_HELP)}
           </label>
           <div className="col-xs-4">
             {sinceControl}
           </div>
           <label className="col-xs-2 control-label">
             Until
             {this.renderTooltipHelp(UNTIL_HELP)}
           </label>
           <div className="col-xs-4">
             {untilControl}
           </div>
           <label style={{'padding-top': '20px'}}
             className="col-xs-2 control-label">
             Limit
             {this.renderTooltipHelp(LIMIT_HELP)}
           </label>
           <div style={{'padding-top': '10px'}}
             className="col-xs-4">
             {limitControl}
           </div>
         </span>
         : null}
      </div>);
    return result;
  },

  renderHelpRow() {
    const templateSelector = (
      <TemplateSelector
        templates={this.props.queryTemplates}
        query={this.query()}
        updateQueryFn={(query) => this.updateLocalState(['query'], query)}
      />
    );
    return this.renderFormControl('', templateSelector);
  },

  renderFieldsInput() {
    const control = (<textarea
                       value={this.query(['query', 'fields'])}
                       onChange={(e) => this.updateLocalState(['query', 'query', 'fields'], e.target.value)}
                       className="form-control" rows="6" required/>);
    return this.renderFormControl('Fields', control, FIELDS_HELP);
  },

  renderInputControl(propertyPath, className = 'form-control') {
    return (
      <input
        type="text"
        value={this.query(propertyPath)}
        onChange={(e) => this.updateLocalState(['query'].concat(propertyPath), e.target.value)}
        className={className}
      />
    );
  },

  renderInput(caption, propertyPath, helpText) {
    const inputControl = this.renderInputControl(propertyPath);
    return this.renderFormControl(caption, inputControl, helpText);
  },

  renderFormControl(controlLabel, control, helpText) {
    return (
      <div className="form-group">
        <label className="col-xs-2 control-label">
          {controlLabel}
          {this.renderTooltipHelp(helpText)}
        </label>
        <div className="col-xs-10">
          {control}
        </div>
      </div>
    );
  },

  renderTooltipHelp(message) {
    if (!message) return null;
    return (
      <small>
        <OverlayTrigger placement="right" overlay={<Tooltip>{message}</Tooltip>}>
          <i className="fa fa-fw fa-question-circle"></i>
        </OverlayTrigger>
      </small>
    );
  },

  renderAccountSelector() {
    const hasIds = this.query('query', Map()).has('ids');
    const ids = this.query(['query', 'ids'], '');
    const value = hasIds ? ids : '--no-page--';
    return (
      <Input
        type="select"
        value={value}
        label="Pages"
        labelClassName="col-xs-2"
        wrapperClassName="col-xs-10"
        onChange={this.onSelectAccount}>
        <option value="">
          --all pages--
        </option>
        <option value="--no-page--">
          --no page--
        </option>
        {this.renderAccountsOptionsArray()}
      </Input>
    );
  },

  onSelectAccount(event) {
    const value = event.target.value;
    const query = this.query('query');
    if (value === '--no-page--') {
      this.updateLocalState(['query', 'query'], query.delete('ids'));
    } else {
      this.updateLocalState(['query', 'query'], query.set('ids', value));
    }
  },

  renderAccountsOptionsArray() {
    return this.props.accounts.map((account, accountId) =>
      <option value={accountId}>
        {account.get('name')}
      </option>
    );
  },

  localState(path, defaultVal) {
    return this.props.localState.getIn([].concat(path), defaultVal);
  },

  query(path, defaultValue) {
    if (path) {
      return this.localState(['query'].concat(path), defaultValue);
    } else {
      return this.localState(['query'], defaultValue);
    }
  },

  updateLocalState(path, newValue) {
    return this.props.updateLocalState([].concat(path), newValue);
  },

  handleSave() {
    this.props.onSaveQuery(this.query()).then(
      () => this.props.onHideFn());
  }

});
