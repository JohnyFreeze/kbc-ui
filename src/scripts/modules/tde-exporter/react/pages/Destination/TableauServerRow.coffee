React = require 'react'
_ = require 'underscore'
#DropboxModal = React.createFactory require './DropboxModal'
{button, strong, div, h2, span, h4, section, p} = React.DOM
{OverlayTrigger, Tooltip, Button} = require 'react-bootstrap'
Button = React.createFactory(Button)
{Map} = require 'immutable'
Confirm = require '../../../../../react/common/Confirm'
TableauServerCredentialsModal = React.createFactory require './TableauServerCredentialsModal'

module.exports = React.createClass
  displayName: 'TableauServerRow'

  propTypes:
    updateLocalStateFn: React.PropTypes.func
    localState: React.PropTypes.object
    configId: React.PropTypes.string
    account: React.PropTypes.object
    setConfigDataFn: React.PropTypes.func

  render: ->
    div {className: 'row'},
      @props.renderComponent()
      div className: 'col-md-4',
        @_renderAuthorizedInfo()
      div className: 'col-md-3',
        Button
          bsSize: 'small'
          className: 'btn btn-primary'
          onClick: =>
            @props.updateLocalStateFn(['tableauServerModal', 'show'], true)
        ,
          'Setup credentials to Tableau Server'

        TableauServerCredentialsModal
          configId: @props.configId
          localState: @props.localState.get('tableauServerModal', Map())
          updateLocalState: (data) =>
            @props.updateLocalStateFn(['tableauServerModal'], data)
          credentials: @props.account
          saveCredentialsFn: (credentials) =>
            path = ['parameters', 'tableauServer']
            @props.setConfigDataFn(path, credentials)

  _isAuthorized: ->
    @props.account and
      not _.isEmpty(@props.account.get('server_url')) and
      not _.isEmpty(@props.account.get('username')) and
      not _.isEmpty(@props.account.get('password')) and
      not _.isEmpty(@props.account.get('project_id'))

  _renderAuthorizedInfo: ->
    if @_isAuthorized()
      span null,
        strong null,
          "#{@props.account.get('username')}@#{@props.account.get('server_url')}"
        React.createElement Confirm,
          title: 'Delete Credentials'
          text: "Do you really want to delete credentials for #{@props.account.get('server_url')}"
          buttonLabel: 'Delete'
          onConfirm: =>
            @props.setConfigDataFn(['parameters', 'tableauServer'], null)
        ,
          Button
            bsSize: 'small'
          ,
            'Delete'
    else
      'No Credentials.'
