import React, {PropTypes} from 'react';
import {ButtonToolbar, Button, Modal} from 'react-bootstrap';
import contactSupport from '../../../../../utils/contactSupport';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool,
    onHideFn: PropTypes.func
  },

  render() {
    return (
      <div className="static-modal">
        <Modal
          show={this.props.show}
          onHide={this.props.onHideFn}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Redshift Backend Not Enabled
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <span className="col-md-12">
                Redshift is not enabled for this project, please
                <a onClick={this.openSupportModal}> contact us </a>
                to get more info.
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                bsStyle="link"
                onClick={this.props.onHideFn}>Close
              </Button>
            </ButtonToolbar>
          </Modal.Footer>

        </Modal>
      </div>
    );
  },

  openSupportModal(e) {
    contactSupport({type: 'project'});
    e.preventDefault();
    e.stopPropagation();
  }

});
