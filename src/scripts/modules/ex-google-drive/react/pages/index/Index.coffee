React = require 'react'

createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
ExGdriveStore = require '../../../exGdriveStore'
RoutesStore = require '../../../../../stores/RoutesStore'
LatestJobsStore = require '../../../../jobs/stores/LatestJobsStore'

RunExtraction = React.createFactory(require '../../components/RunExtraction')
RunButtonModal = React.createFactory(require('../../../../components/react/components/RunComponentButton'))

DeleteConfigurationButton = require '../../../../components/react/components/DeleteConfigurationButton'
DeleteConfigurationButton = React.createFactory DeleteConfigurationButton
ComponentMetadata = require '../../../../components/react/components/ComponentMetadata'
LatestJobs = require '../../../../components/react/components/SidebarJobs'

ComponentDescription = require '../../../../components/react/components/ComponentDescription'
ComponentDescription = React.createFactory(ComponentDescription)
Link = React.createFactory(require('react-router').Link)

ItemsTable = React.createFactory(require './ItemsTable')

{strong, br, ul, li, div, span, i} = React.DOM

module.exports = React.createClass
  displayName: 'ExGdriveIndex'
  mixins: [createStoreMixin(ExGdriveStore, LatestJobsStore)]

  getStateFromStores: ->
    config =  RoutesStore.getCurrentRouteParam('config')
    configuration: ExGdriveStore.getConfig(config)
    deletingSheets: ExGdriveStore.getDeletingSheets(config)
    latestJobs: LatestJobsStore.getJobs 'ex-google-drive', config

  isAuthorized: ->
    @state.configuration.has 'email'

  render: ->
    #console.log @state.configuration.toJS()
    div {className: 'container-fluid'},
      @_renderMainContent()
      @_renderSideBar()

  _renderMainContent: ->
    items = @state.configuration.get('items')
    div {className: 'col-md-9 kbc-main-content'},
      div className: 'row kbc-header',
        div className: 'col-sm-8',
          ComponentDescription
            componentId: 'ex-google-drive'
            configId: @state.configuration.get('id')
        div className: 'col-sm-4 kbc-buttons',
          Link
            to: 'ex-google-drive-select-sheets'
            disabled: not @isAuthorized()

            params:
              config: @state.configuration.get 'id'
            className: 'btn btn-success'
          ,
            span className: 'kbc-icon-plus'
            ' Select Sheets'
      if items.count()
        ItemsTable
          items: items
          configurationId: @state.configuration.get 'id'
          deletingSheets: @state.deletingSheets
      else
        div className: 'well',
          div null, 'no sheets yet'
        ,
          Link
            className: 'btn btn-primary'
            to: 'ex-google-drive-authorize'
            params:
              config: @state.configuration.get 'id'
          ,
            i className: 'fa fa-fw fa-user'
            ' Authorize and Select Sheets'


  _renderSideBar: ->
    div {className: 'col-md-3 kbc-main-sidebar'},
      ul className: 'nav nav-stacked',
        li null,
          Link
            to: 'ex-google-drive-authorize'
            params:
              config: @state.configuration.get 'id'
          ,
            i className: 'fa fa-fw fa-user'
            ' Authorize'
        li null,
          RunButtonModal
            title: 'Run Extraction'
            mode: 'link'
            component: 'ex-google-drive'
            runParams: =>
              config: @state.configuration.get 'id'
          ,
            'You are about to run the extraction of this configuration.'

        li null,
          DeleteConfigurationButton
            componentId: 'ex-google-drive'
            configId: @state.configuration.get 'id'
      span null,
        'Authorized for: '
        strong null,
        if @isAuthorized()
          @state.configuration.get 'email'
        else
          'not authorized'

      React.createElement ComponentMetadata,
        componentId: 'ex-google-drive'
        configId: @state.configuration.get 'id'

      React.createElement LatestJobs,
        jobs: @state.latestJobs
