import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (error) => {
      console.log('Cannot connect to a redis client ', error);
    });
  }

  isAlive() {
    if (this.client.connected === true) {
      return false;
    }
    return true;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async set(stringKey, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(stringKey, duration, value, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response === 1);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
