React = require 'react'
{Map, fromJS} = require 'immutable'
_ = require 'underscore'
classnames = require 'classnames'
createStoreMixin = require '../../../../../react/mixins/createStoreMixin'
LatestJobsStore = require '../../../../jobs/stores/LatestJobsStore'
LatestJobs = require '../../../../components/react/components/SidebarJobs'
RoutesStore = require '../../../../../stores/RoutesStore'
Link = React.createFactory(require('react-router').Link)
RowEditor = require './RowEditor'

SearchRow = require('../../../../../react/common/SearchRow').default
GdriveStore = require '../../../wrGdriveStore'
InstalledComponentsStore = require '../../../../components/stores/InstalledComponentsStore'
InstalledComponentsActions = require '../../../../components/InstalledComponentsActionCreators'

TablesByBucketsPanel = React.createFactory require('../../../../components/react/components/TablesByBucketsPanel')

ComponentDescription = require '../../../../components/react/components/ComponentDescription'
ComponentDescription = React.createFactory(ComponentDescription)
DeleteConfigurationButton = require '../../../../components/react/components/DeleteConfigurationButton'
ComponentMetadata = require '../../../../components/react/components/ComponentMetadata'
RunButtonModal = React.createFactory(require('../../../../components/react/components/RunComponentButton'))
TableRow = React.createFactory(require './TableRow')
gdriveActions = require '../../../wrGdriveActionCreators'

{button, i, strong, span, div, p, ul, li} = React.DOM

componentId = 'wr-google-drive'

module.exports = React.createClass
  displayName: 'WrGdriveIndex'
  mixins: [createStoreMixin(InstalledComponentsStore, GdriveStore, LatestJobsStore)]

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')
    localState = InstalledComponentsStore.getLocalState(componentId, configId)
    files = GdriveStore.getFiles configId
    editingFiles = GdriveStore.getEditingByPath(configId, 'files')
    newTableEditData = GdriveStore.getEditingByPath(configId, 'newtable')
    savingFiles = GdriveStore.getSavingFiles(configId)
    deletingFiles = GdriveStore.getDeletingFiles(configId)
    account = GdriveStore.getAccount(configId)
    #console.log "FILES", files.toJS()

    #state
    newTableEditData: newTableEditData
    latestJobs: LatestJobsStore.getJobs(componentId, configId)
    account: account
    deletingFiles: deletingFiles
    savingFiles: savingFiles
    editingFiles: editingFiles
    files: files
    configId: configId
    localState: localState
    googleInfo: GdriveStore.getGoogleInfo(configId)

  render: ->
    div {className: 'container-fluid'},
      @_renderMainContent()
      @_renderSideBar()

  componentDidMount: ->
    @state.files.forEach (file, tableId) =>
      targetFolder = file.get 'targetFolder'
      if not _.isEmpty(targetFolder)
        @_loadGoogleInfo(targetFolder)

    #if no files are configured then show all tables
    if @state.files.count() == 0
      @_updateLocalState(['showAll'], true)


  _renderMainContent: ->
    tablesIds = @state.files?.keySeq()
    div {className: 'col-md-9 kbc-main-content'},
      div className: 'row kbc-header',
        div className: 'col-sm-8',
          ComponentDescription
            componentId: componentId
            configId: @state.configId
        if @_isAuthorized() and @_isConfigured()
          div className: 'col-sm-4 kbc-buttons',
            @_renderAddNewTable()
            @_addNewTableButton()
      if @_isAuthorized() and @_isConfigured()
        React.createElement SearchRow,
          className: 'row kbc-search-row'
          onChange: @_handleSearchQueryChange
          query: @state.localState.get('searchQuery') or ''
      if @_isAuthorized() and @_isConfigured()
        TablesByBucketsPanel
          renderTableRowFn: @_renderTableRow
          renderHeaderRowFn: @_renderHeaderRow
          filterFn: @_filterBuckets
          searchQuery: @state.localState.get('searchQuery')
          isTableExportedFn: (tableId) =>
            @state.files.has(tableId)
          onToggleBucketFn: @_handleToggleBucket
          isBucketToggledFn: @_isBucketToggled
          showAllTables: false
          configuredTables: tablesIds.toJS()
          renderDeletedTableRowFn: (table) =>
            @_renderTableRow(table, true)

      else
        div className: 'row component-empty-state text-center',
          if not @_isAuthorized()
            div null,
              p null, 'No Google Drive Account Authorized.'
              Link
                className: 'btn btn-success'
                to: 'wr-google-drive-authorize'
                params:
                  config: @state.configId
              ,
                i className: 'fa fa-fw fa-user'
                ' Authorize Google Account'
          else
            div null,
              p null, 'No tables configured yet.'
              @_renderAddNewTable()
              @_addNewTableButton()


  _addNewTableButton: ->
    button
      className: 'btn btn-success'
      onClick: =>
        emptyFile =
          title: ''
          tableId: ''
          operation: 'update'
          type: 'sheet'
        path = ['newtable']
        gdriveActions.setEditingData(@state.configId, path, fromJS(emptyFile))
    ,
      span className: 'kbc-icon-plus'
      ' Add Table'





  _renderSideBar: ->
    div {className: 'col-md-3 kbc-main-sidebar'},
      div className: 'kbc-buttons kbc-text-light',
        span null,
          'Authorized for '
        strong null,
          @_getAuthorizedForCaption()
        React.createElement ComponentMetadata,
          componentId: componentId
          configId: @state.configId

      ul className: 'nav nav-stacked',
        if @_isAuthorized()
          li null,
            Link
              to: 'wr-google-drive-authorize'
              params:
                config: @state.configId
            ,
              i className: 'fa fa-fw fa-user'
              'Authorize'
        li className: classnames(disabled: !!@_disabledToRun()),
          RunButtonModal
            disabled: !!@_disabledToRun()
            disabledReason: @_disabledToRun()
            title: "Run"
            tooltip: "Upload all selected tables"
            mode: 'link'
            icon: 'fa fa-play fa-fw'
            component: componentId
            runParams: =>
              config: @state.configId
          ,
           "You are about to run upload of all seleted tables"
        li null,
          React.createElement DeleteConfigurationButton,
            componentId: componentId
            configId: @state.configId
      React.createElement LatestJobs,
        jobs: @state.latestJobs

  _renderHeaderRow: ->
    div className: 'tr',
      span className: 'th',
        strong null, 'Table name'
      span className: 'th',
        ''
      span className: 'th',
        strong null, 'Title'
      span className: 'th',
        strong null, 'Operation'
      span className: 'th',
        strong null, 'Type'
      span className: 'th',
        strong null, 'Folder'

  _renderAddNewTable: ->
    tablesIds = @state.files?.keySeq().toJS()
    if @state.newTableEditData
      #return div className: 'table table-striped',
        # div className: 'thead',
        #   @_renderHeaderRow()
        # div className: 'tbody',
      return React.createElement RowEditor,
        table: null
        updateGoogleFolderFn: (info, googleId) =>
          @_updateGoogleFolder(@state.configId, googleId, info)
        email: @state.account?.get 'email'
        googleInfo: @state.googleInfo
        saveFn: (data) =>
          tableId = data.get 'tableId'
          gdriveActions.saveFile(@state.configId, tableId, data)
        editData: @state.newTableEditData
        editFn: (data) =>
          path = ['newtable']
          gdriveActions.setEditingData(@state.configId, path, data)
        isSavingFn: (tableId) =>
          !!@state.savingFiles.get(tableId)
        renderToModal: true
        configuredTableIds: tablesIds

  _renderTableRow: (table, isDeleted = false) ->
    tableId = table.get 'id'
    isSaving = (@state.savingFiles.get(tableId) or @state.deletingFiles.get(tableId))

    TableRow
      email: @state.account?.get 'email'
      key: tableId
      configId: @state.configId
      editFn: (data) =>
        @_setEditingFile tableId, data
      deleteRowFn: (rowId) =>
        gdriveActions.deleteRow(@state.configId, rowId, tableId)
      saveFn: (data) =>
        gdriveActions.saveFile(@state.configId, tableId, data)
      isSavingFn: (tableId) ->
        isSaving
      editData: @state.editingFiles?.get tableId
      table: table
      file: @state.files.find (f) ->
        f.get('tableId') == tableId
      googleInfo: @state.googleInfo
      updateGoogleFolderFn: (info, googleId) =>
        @_updateGoogleFolder(@state.configId, googleId, info)
      loadGoogleInfoFn: (googleId) =>
        @_loadGoogleInfo(googleId)
      isLoadingGoogleInfoFn: (googleId) =>
        GdriveStore.getLoadingGoogleInfo(@state.configId, googleId)
      isDeleted: isDeleted



  _setEditingFile: (tableId, data) ->
    path = ['files', tableId]
    gdriveActions.setEditingData(@state.configId, path, data)

  _loadGoogleInfo: (googleId) ->
    gdriveActions.loadGoogleInfo(@state.configId, googleId)

  _isAuthorized: ->
    return !!@state.account?.get('email')

  _disabledToRun: ->
    if not @_isAuthorized()
      return 'No Google Drive Account'
    if @state.files?.count() == 0
      return 'No tables configured'
    return null

  _isConfigured: ->
    @state.files?.count() > 0

  _handleSearchQueryChange: (newQuery) ->
    @_updateLocalState(['searchQuery'], newQuery)


  _filterBuckets: (buckets) ->
    buckets = buckets.filter (bucket) ->
      bucket.get('stage') == 'out' or bucket.get('stage') == 'in'
    return buckets

  _handleToggleBucket: (bucketId) ->
    newValue = !@_isBucketToggled(bucketId)
    bucketToggles = @state.localState.get 'bucketToggles', Map()
    newToggles = bucketToggles.set(bucketId, newValue)
    @_updateLocalState(['bucketToggles'], newToggles)

  _isBucketToggled: (bucketId) ->
    bucketToggles = @state.localState.get 'bucketToggles', Map()
    !!bucketToggles.get(bucketId)

  _getEmail: ->
    @state.account.get 'email'

  _getAuthorizedForCaption: ->
    email = @_getEmail()
    if not email
      return 'not authorized'
    else
      email

  _updateGoogleFolder: (configId, googleId, info) ->
    gdriveActions.setGoogleInfo(configId, googleId, info)

  _updateLocalState: (path, data) ->
    newLocalState = @state.localState.setIn(path, data)
    InstalledComponentsActions.updateLocalState(componentId, @state.configId, newLocalState, path)
