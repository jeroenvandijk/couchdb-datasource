# Flexible SproutCore DataSource for CouchDB

This framework provides a flexible DataSource for CouchDB that just works, given you don't care about performance. You probably only want to use this DataSource during the prototyping of your app.

## Installation

Clone this repo in the frameworks directory of your app.

Make sure you have couchdb installed (use the following for homebrew)

    brew install couchdb
    
Make sure your buildfile has something like the following

  config :all, :required => [:sproutcore, :couchdb]

  proxy "/sc-datasource", :to => "localhost:5984"
    

Add the following lines to your core.js file, remove other similar lines

    store: SC.Store.create({
      commitRecordsAutomatically: YES
    }).from('CouchDB')

Create the CouchDB database:

    curl -X PUT http://127.0.0.1:5984/sc-datasource
    
Add a design document to the database:

    curl -X PUT http://127.0.0.1:5984/sc-datasource/_design/sc-datasource -d '{"_id": "_design/sc_datasource", "views": { "by-sc-type": { "map": "function(doc) { if (doc.sc_type) { emit(doc.sc_type, doc); } };" } } }'

To test if that worked:

    curl http://127.0.0.1:5984/sc-datasource/_design/sc-datasource/_view/by-sc-type

This should give you the following output: 

    {"total_rows":0,"offset":0,"rows":[]}

Thats it.


## TODO

Battletest this framework while prototyping. I have currently confirmed that it works with the Sample Todo app and with my own app. I need more people to use it before I know it flexible enough.

## Credits

Ido Ran for creating the Couchdb tutorial (http://wiki.sproutcore.com/w/page/31341406/Todos%2006%20-%20Building%20with%20CouchDB). Some of the code is actually from his examples.

## License

MIT