import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const AppController = {
  async getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    const getstatus = {
      redis: redisAlive,
      db: dbAlive,
    };

    res.status(200).json(getstatus);
  },

  async getStats(req, res) {
    try {
      const userCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      const stats = {
        users: userCount,
        files: filesCount,
      };

      res.status(200).json(stats);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default AppController;
