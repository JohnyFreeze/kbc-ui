React = require 'react'
ComponentsActionCreators = require '../../ComponentsActionCreators'
ComponentIcon = React.createFactory(require('../../../../react/common/ComponentIcon').default)
ComponentDetailLink = React.createFactory(require('../../../../react/common/ComponentDetailLink'))
SearchRow = React.createFactory(require('../../../../react/common/SearchRow').default)
Link = React.createFactory(require('react-router').Link)
Modal = React.createFactory(require('react-bootstrap').Modal)
ModalHeader = React.createFactory(require('react-bootstrap/lib/ModalHeader'))
ModalBody = React.createFactory(require('react-bootstrap/lib/ModalBody'))
ModalFooter = React.createFactory(require('react-bootstrap/lib/ModalFooter'))
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)


{div, table, tbody, tr, td, ul, li, a, span, h2, p, button} = React.DOM

require('./NewComponentSelection.less')

ComponentBox = React.createClass
  displayName: 'ComponentBox'
  propTypes:
    component: React.PropTypes.object.isRequired

  shouldComponentUpdate: (nextProps) ->
    @props.component == nextProps.component

  render: ->
    component = @props.component
    div className: 'td',
      ComponentIcon
        component: component
        size: '64'
      h2 null,
        component.get('name')
      p null, component.get('description')
      ComponentDetailLink
        componentId: @props.component.get("id")
        type: @props.component.get("type")

        button
          className: 'btn btn-success'
          onClick: @open
        ,
          'More'

module.exports = React.createClass
  displayName: 'NewComponentSelection'
  propTypes:
    components: React.PropTypes.object.isRequired
    filter: React.PropTypes.string.isRequired
    componentType: React.PropTypes.string.isRequired

  render: ->
    div className: @props.className,
      @props.children
      SearchRow(className: 'row kbc-search-row', onChange: @_handleFilterChange, query: @props.filter)
      div className: 'table kbc-table-border-vertical kbc-components-overview kbc-layout-table',
        div className: 'tbody',
          @_renderComponents()
      div className: 'row',
        div className: 'text-center',
          h2 null, 'Haven\'t found what you are looking for?'
          a
            className: 'btn btn-primary'
            href: 'mailto:support@keboola.com'
          ,
            'Let us know'

  _handleFilterChange: (query) ->
    ComponentsActionCreators.setComponentsFilter(query, @props.componentType)

  _renderComponents: ->
    @props.components
    .toIndexedSeq()
    .sortBy((component) -> component.get('name').toLowerCase())
    .groupBy((component, i) -> Math.floor(i / 3))
    .map(@_renderComponentsRow, @)
    .toArray()

  _renderComponentsRow: (components, idx) ->
    div
      className: 'tr'
      key: idx
    , components.map((component) ->
      React.createElement ComponentBox, component: component, key: component.get('id')
    ).toArray()
