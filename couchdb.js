// ==========================================================================
// Project:   CouchDB
// Copyright: ©2010 Jeroen van Dijk
// ==========================================================================
/*globals CouchDB */

/** @class

  Drop-in DataSource object for CouchDB. Focus on building your client app first, and focus
  on the backend later.

  @extends SC.DataSource
*/
CouchDB = SC.DataSource.extend(
/** @scope CouchDB.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  //
  databaseName: "sc-datasource",
  viewPath: "/_design/sc_datasource/_view/by-sc-type",
  
  // Retrieves all document for the recordType defined in the query
  fetch: function(store, query) {
    var recordType, requestPath;

    recordType = query.get('recordType')
    requestPath = this.getResourcesPath() + '?key="' + recordType + '"'

    SC.Request.getUrl(requestPath).json()
              .header('Accept', 'application/json')
              .notify(this, '_didFetch', store, query)
              .send();

    return YES;
  },

  // ..........................................................
  // RECORD SUPPORT
  // 
  retrieveRecord: function(store, storeKey) {
    var doc = store.readDataHash(storeKey);
    
    SC.Request.getUrl(this.getResourcePath(doc)).json()
                      .header('Accept', 'application/json')
                      .notify(this, '_didComplete', store, storeKey)
                      .send();

    return YES;
  },
  
  createRecord: function(store, storeKey) {
    var doc = store.readDataHash(storeKey)
    doc.sc_type = store.recordTypeFor(storeKey).toString();

    SC.Request.postUrl(this.getResourcePath()).json()
              .header('Accept', 'application/json')
              .notify(this, '_didComplete', store, storeKey)
              .send(doc);
    
    return YES;
  },
  
  updateRecord: function(store, storeKey) {
    var doc = store.readDataHash(storeKey);

    SC.Request.putUrl(this.getResourcePath(doc)).json()
                      .header('Accept', 'application/json')
                      .notify(this, '_didComplete', store, storeKey)
                      .send(doc);

    return YES;
  },
  
  destroyRecord: function(store, storeKey) {
    var doc = store.readDataHash(storeKey);

    SC.Request.deleteUrl(this.getResourcePath(doc)).json()
                      .header('Accept', 'application/json')
                      .notify(this, '_didDestroy', store, storeKey)
                      .send();
                      
    return YES;
  },
  
  getResourcePath: function(doc) {
    var path = '/' + this.databaseName;

    if(doc !== undefined) {
      path += '/' + doc._id + '?rev=' + doc._rev;
    }

    return path;
  },

  getResourcesPath: function() {
    var path = '/' + this.databaseName + this.viewPath;
    return path;
  },
  
  _didFetch: function(response, store, query) {
    if (SC.ok(response)) {
      var decodedBody = this._decodedResponseBody(response);

      var records = decodedBody.rows.getEach('value');
      var ids     = records.getEach('_id');
      var recordType = query.get('recordType');
      
      store.loadRecords(recordType, records, ids);

      store.dataSourceDidFetchQuery(query);
    } else {
      store.dataSourceDidErrorQuery(query, response);
    }
  },
  
  _didComplete: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var decodedBody = this._decodedResponseBody(response);
      
      var doc = store.readDataHash(storeKey);

      // Add _id and _rev to the doc for further server interaction.
      doc._id = decodedBody.id;
      doc._rev = decodedBody.rev;
      
      store.dataSourceDidComplete(storeKey, doc, doc._id);
    } else {
      store.dataSourceDidError(storeKey);
    }
  },
  
  _didDestroy: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidDestroy(storeKey)
    } else {
      store.dataSourceDidError(storeKey);
    }
  },

  _decodedResponseBody: function(response) {
    var body = response.get('encodedBody');
    return SC.json.decode(body);
  }
  
}) ;
