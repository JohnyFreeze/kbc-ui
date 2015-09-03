import React, {PropTypes} from 'react/addons';
import {Input, Button} from 'react-bootstrap';
import {Loader} from 'kbc-react-components';

export default React.createClass({
  propTypes: {
    isPending: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    dimension: PropTypes.object.isRequired,
    className: PropTypes.string
  },

  mixins: [React.addons.PureRenderMixin],

  getDefaultProps() {
    return {
      className: 'form-horizontal'
    };
  },

  render() {
    const {dimension, className, isPending} = this.props;
    return (
      <div>
        <h3>Add Dimension</h3>
        <div className={className}>
          <Input
            type="text"
            label="Name"
            value={dimension.get('name')}
            onChange={this.handleInputChange.bind(this, 'name')}
            labelClassName="col-sm-3"
            wrapperClassName="col-sm-9"
            />
          <Input
            type="checkbox"
            label="Include time"
            checked={dimension.get('includeTime')}
            onChange={this.handleCheckboxChange.bind(this, 'includeTime')}
            wrapperClassName="col-sm-offset-3 col-sm-9"
            />
          <div className="form-group">
            <div className="col-sm-offset-3 col-sm-10">
              <Button
                bsStyle="success"
                disabled={this.props.isPending || !this.props.dimension.get('name').trim().length}
                onClick={this.props.onSubmit}
                >
                Create
              </Button> {isPending ? <Loader/> : null}
            </div>
          </div>
        </div>
      </div>
    );
  },

  handleInputChange(field, e) {
    this.props.onChange(this.props.dimension.set(field, e.target.value));
  },

  handleCheckboxChange(field, e) {
    this.props.onChange(this.props.dimension.set(field, e.target.checked));
  }

});