import pkg from 'mongodb';

const { MongoClient } = pkg;

class DBClient {
  constructor() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 27017;
    const dbName = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${dbHost}:${dbPort}/${dbName}`;
    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.client.connect((error) => {
      if (error) {
        console.log('Mongodb connection error', error);
      }
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const nbUserCollections = await this.client.db().collection('users');
    return nbUserCollections.countDocuments();
  }

  async nbFiles() {
    const filesCollections = await this.client.db().collection('files');
    return filesCollections.countDocuments();
  }
}
const dbClient = new DBClient();
export default dbClient;
