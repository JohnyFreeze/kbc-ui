
request = require '../../utils/request'

ApplicationStore = require '../../stores/ApplicationStore'
ComponentsStore = require '../components/stores/ComponentsStore'

createUrl = (path) ->
  baseUrl = ComponentsStore.getComponent('transformation').get('uri')
  "#{baseUrl}/#{path}"

createRequest = (method, path) ->
  request(method, createUrl(path))
  .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString())

transformationsApi =

  getTransformationBuckets: ->
    createRequest('GET', 'configs')
    .promise()
    .then((response) ->
      response.body
    )


  getTransformations: (bucketId) ->
    createRequest('GET', "configs/#{bucketId}/items")
    .promise()
    .then((response) ->
      response.body
    )
    
module.exports = transformationsApi