React = require 'react'
_ = require('underscore')
Immutable = require('immutable')
{Input} = require('react-bootstrap')
Input = React.createFactory Input
Select = React.createFactory require('../../../../../react/common/Select').default
DaysFilterInput = require('./DaysFilterInput').default
DataFilterRow = require('./DataFilterRow').default



module.exports = React.createClass
  displayName: 'TableInputMappingEditor'

  propTypes:
    value: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired
    disabled: React.PropTypes.bool.isRequired
    initialShowDetails: React.PropTypes.bool.isRequired
    showFileHint: React.PropTypes.bool
    isDestinationDuplicate: React.PropTypes.bool.isRequired

  getInitialState: ->
    showDetails: @props.initialShowDetails

  getDefaultProps: ->
    showFileHint: true

  _handleToggleShowDetails: (e) ->
    @setState(
      showDetails: e.target.checked
    )

  shouldComponentUpdate: (nextProps, nextState) ->
    should = @props.value != nextProps.value ||
        @props.tables != nextProps.tables ||
        @props.disabled != nextProps.disabled ||
        @state.showDetails != nextState.showDetails

    should

  _handleChangeSource: (value) ->
    immutable = @props.value.withMutations (mapping) ->
      mapping = mapping.set("source", value)
      # use only table name from the table identifier
      destination = value.substr(value.lastIndexOf(".") + 1) + ".csv"
      mapping = mapping.set("destination", destination)
      mapping = mapping.set("where_column", "")
      mapping = mapping.set("where_values", Immutable.List())
      mapping = mapping.set("where_operator", "eq")
      mapping = mapping.set("columns", Immutable.List())
    @props.onChange(immutable)

  _handleChangeDestination: (e) ->
    value = @props.value.set("destination", e.target.value)
    @props.onChange(value)

  _handleChangeColumns: (newValue) ->
    immutable = @props.value.withMutations (mapping) ->
      mapping = mapping.set("columns", newValue)
      if !_.contains(mapping.get("columns").toJS(), mapping.get("where_column"))
        mapping = mapping.set("where_column", "")
        mapping = mapping.set("where_values", Immutable.List())
        mapping = mapping.set("where_operator", "eq")
    @props.onChange(immutable)

  _getTables: ->
    props = @props
    inOutTables = @props.tables.filter((table) ->
      table.get("id").substr(0, 3) == "in." || table.get("id").substr(0, 4) == "out."
    )
    map = inOutTables.map((table) ->
      {
        label: table.get("id")
        value: table.get("id")
      }
    )
    map.toList().sort( (valA, valB) ->
      return 1 if valA.label > valB.label
      return -1 if valA.label < valB.label
      return 0
    ).toJS()

  _getColumns: ->
    if !@props.value.get("source")
      return []
    props = @props
    table = @props.tables.find((table) ->
      table.get("id") == props.value.get("source")
    )
    table.get("columns").toJS()

  _getColumnsOptions: ->
    columns = @_getColumns()
    map = _.map(
      columns, (column) ->
        {
          label: column
          value: column
        }
    )

  _getFilteredColumnsOptions: ->
    if @props.value.get("columns").count()
      columns = @props.value.get("columns").toJS()
    else
      columns = @_getColumns()
    _.map(
      columns, (column) ->
        {
          label: column
          value: column
        }
    )

  _getFileName: ->
    if @props.value.get("destination") && @props.value.get("destination") != ''
      return @props.value.get("destination")
    if @props.value.get("source") && @props.value.get("source") != ''
      return @props.value.get("source")
    return ''

  render: ->
    component = @
    React.DOM.div {className: 'form-horizontal clearfix'},
      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group form-group-sm',
          React.DOM.div className: 'col-xs-10 col-xs-offset-2',
            Input
              standalone: true
              type: 'checkbox'
              label: React.DOM.small {}, 'Show details'
              checked: @state.showDetails
              onChange: @_handleToggleShowDetails

      React.DOM.div {className: "row col-md-12"},
        React.DOM.div className: 'form-group',
          React.DOM.label className: 'col-xs-2 control-label', 'Source'
          React.DOM.div className: 'col-xs-10',
            Select
              name: 'source'
              value: @props.value.get("source")
              disabled: @props.disabled
              placeholder: "Source table"
              onChange: @_handleChangeSource
              options: @_getTables()
        React.DOM.div {className: "row col-md-12"},
          Input
            type: 'text'
            label: 'File name'
            value: @props.value.get("destination")
            disabled: @props.disabled
            placeholder: "File name"
            onChange: @_handleChangeDestination
            labelClassName: 'col-xs-2'
            wrapperClassName: 'col-xs-10'
            bsStyle: if @props.isDestinationDuplicate then 'error' else null
            help: if @props.isDestinationDuplicate then React.DOM.small {'className': 'error'},
                'Duplicate destination '
                React.DOM.code {}, @props.value.get("destination")
                '.'
              else React.DOM.span {className: "help-block"},
                if @props.showFileHint
                  React.DOM.span null,
                    "File will be available at"
                    React.DOM.code {}, "/data/in/tables/" + @_getFileName()


      if @state.showDetails
        React.DOM.div {className: "row col-md-12"},
          React.DOM.div className: 'form-group form-group-sm',
            React.DOM.label className: 'col-xs-2 control-label', 'Columns'
            React.DOM.div className: 'col-xs-10',
              Select
                multi: true
                name: 'columns'
                value: @props.value.get("columns", Immutable.List()).toJS()
                disabled: @props.disabled || !@props.value.get("source")
                placeholder: "All columns will be imported"
                onChange: @_handleChangeColumns
                options: @_getColumnsOptions()
              React.DOM.small
                className: "help-block"
              ,
                "Import only specified columns"
      if @state.showDetails
        React.createElement DaysFilterInput,
          mapping: @props.value
          disabled: @props.disabled
          onChange: @props.onChange
      if @state.showDetails
        React.createElement DataFilterRow,
          value: @props.value
          disabled: @props.disabled
          onChange: @props.onChange
          allTables: @props.tables
