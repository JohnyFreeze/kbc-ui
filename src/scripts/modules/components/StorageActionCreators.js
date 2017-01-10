import Promise from 'bluebird';
import ApplicationStore from '../../stores/ApplicationStore';
import dispatcher from '../../Dispatcher';
import constants from './Constants';
import StorageBucketsStore from './stores/StorageBucketsStore';
import StorageTablesStore from './stores/StorageTablesStore';
import StorageTokensStore from './stores/StorageTokensStore';
import StorageFilesStore from './stores/StorageFilesStore';
import storageApi from './StorageApi';
import jobPoller from '../../utils/jobPoller';

module.exports = {

  loadBucketsForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKETS_LOAD
    });
    return storageApi.getBuckets().then(function(buckets) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKETS_LOAD_SUCCESS,
        buckets: buckets
      });
    })
    .catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKETS_LOAD_ERROR,
        status: error.status,
        response: error.response
      });
      throw error;
    });
  },

  loadCredentialsForce: function(bucketId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_LOAD,
      bucketId: bucketId
    });
    return storageApi.getBucketCredentials(bucketId).then(function(credentials) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_LOAD_SUCCESS,
        credentials: credentials,
        bucketId: bucketId
      });
    });
  },

  loadCredentials: function(bucketId) {
    if (StorageBucketsStore.hasCredentials(bucketId)) {
      return Promise.resolve();
    }
    return this.loadCredentialsForce(bucketId);
  },

  createCredentials: function(bucketId, name) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_CREATE,
      bucketId: bucketId
    });
    return storageApi.createBucketCredentials(bucketId, name).then(function(credentials) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_CREATE_SUCCESS,
        credentials: credentials,
        bucketId: bucketId
      });
      return credentials;
    });
  },

  deleteCredentials: function(bucketId, credentialsId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_DELETE,
      bucketId: bucketId,
      credentialsId: credentialsId
    });
    return storageApi.deleteBucketCredentials(credentialsId).then(function() {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREDENTIALS_DELETE_SUCCESS,
        bucketId: bucketId,
        credentialsId: credentialsId
      });
    });
  },

  loadBuckets: function() {
    if (StorageBucketsStore.getIsLoaded()) {
      this.loadBucketsForce();
      return Promise.resolve();
    }
    if (StorageBucketsStore.getIsLoading()) {
      return Promise.resolve();
    }
    return this.loadBucketsForce();
  },

  loadTablesForce: function() {
    if (StorageTablesStore.getIsLoading()) {
      return Promise.resolve();
    }
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLES_LOAD
    });
    return storageApi.getTables().then(function(tables) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLES_LOAD_SUCCESS,
        tables: tables
      });
    })
    .catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLES_LOAD_ERROR,
        status: error.status,
        response: error.response
      });
      throw error;
    });
  },

  loadTables: function() {
    if (StorageTablesStore.getIsLoaded()) {
      this.loadTablesForce();
      return Promise.resolve();
    }
    if (StorageTablesStore.getIsLoading()) {
      return Promise.resolve();
    }
    return this.loadTablesForce();
  },

  loadTokensForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TOKENS_LOAD
    });
    return storageApi.getTokens().then(function(tokens) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TOKENS_LOAD_SUCCESS,
        tokens: tokens
      });
    })
    .catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TOKENS_LOAD_ERROR,
        errors: error
      });
      throw error;
    });
  },

  loadTokens: function() {
    if (StorageTokensStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadTokensForce();
  },

  createToken: function(params) {
    return storageApi.createToken(params).then(function(token) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TOKEN_CREATE_SUCCESS,
        token: token
      });
    })
    .catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TOKEN_CREATE_ERROR,
        status: error.status,
        response: error.response
      });
      throw error;
    });
  },

  loadFilesForce: function(params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_FILES_LOAD
    });
    return storageApi.getFiles(params).then(function(files) {
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_FILES_LOAD_SUCCESS,
        files: files
      });
    })
    .catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_FILES_LOAD_ERROR,
        errors: error
      });
      throw error;
    });
  },

  loadFiles: function(params) {
    if (StorageFilesStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadFilesForce(params);
  },

  createBucket: function(params) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_BUCKET_CREATE,
      params: params
    });
    return storageApi.createBucket(params).then(function(response) {
      if (response.status === 'error') {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_BUCKET_CREATE_ERROR,
          errors: response.error
        });
        throw response.error.message;
      }
      return dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREATE_SUCCESS,
        bucket: response
      });
    })
    .catch(function(error) {
      var message;
      message = error;
      if (error.message) {
        message = error.message;
      }
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_BUCKET_CREATE_ERROR,
        errors: error
      });
      throw message;
    });
  },

  createTable: function(bucketId, params) {
    var self;
    self = this;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_CREATE,
      bucketId: bucketId,
      params: params
    });
    return storageApi.createTable(bucketId, params).then(function(response) {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(function(response2) {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_TABLE_CREATE_ERROR,
            bucketId: bucketId,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_CREATE_SUCCESS,
          bucketId: bucketId
        });
        return self.loadTablesForce();
      });
    })
    .catch(function(error) {
      var message;
      message = error;
      if (error.message) {
        message = error.message;
      }
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLE_CREATE_ERROR,
        bucketId: bucketId,
        errors: error
      });
      throw message;
    });
  },

  loadTable: function(tableId, params) {
    var self;
    self = this;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.STORAGE_TABLE_LOAD,
      params: params,
      tableId: tableId
    });
    return storageApi.loadTable(tableId, params).then(function(response) {
      return jobPoller.poll(ApplicationStore.getSapiTokenString(), response.url).then(function(response2) {
        if (response2.status === 'error') {
          dispatcher.handleViewAction({
            type: constants.ActionTypes.STORAGE_TABLE_LOAD_ERROR,
            tableId: tableId,
            errors: response2.error
          });
          throw response2.error.message;
        }
        dispatcher.handleViewAction({
          type: constants.ActionTypes.STORAGE_TABLE_LOAD_SUCCESS,
          tableId: tableId,
          response: response2
        });
        return self.loadTablesForce();
      });
    })
    .catch(function(error) {
      var message;
      message = error;
      if (error.message) {
        message = error.message;
      }
      dispatcher.handleViewAction({
        type: constants.ActionTypes.STORAGE_TABLE_LOAD_ERROR,
        tableId: tableId,
        errors: error
      });
      throw message;
    });
  }
};