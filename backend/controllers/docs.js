import Controller from './controller';
import MongoDb from 'mongodb';

let url = 'mongodb://test:123@ds059125.mongolab.com:59125/lostsoul';

export default class DocsCtrl extends Controller {

  static middleware() {
    return require('body-parser').text({ type: 'text/md' });
  }

  update(name) {
    let md = this.req.body;

    MongoDb.MongoClient.connect(url, function(err, db) {
        var collection = db.collection('documents');

        collection.update(
            { name: name },
            { content: md, name: name },
            { upsert: true }
        );

        db.close();
    });
  }

  get(name) {
    return new Promise((resolve, reject) => {
        MongoDb.MongoClient.connect(url, function(err, db) {
            var collection = db.collection('documents'),
                result = [];

            collection.find({}).forEach( doc => {
                result.push(doc);
            }, () => {
                db.close();
                resolve(result);
            });

        });
    });
  }
}
