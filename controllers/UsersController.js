// import crypto from 'crypto';
import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const UsersController = {
  postNew(request, response) {
    const { email } = request.body;
    const { password } = request.body;

    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }

    const users = dbClient.client.db().collection('users');
    users.findOne({ email }, (err, user) => {
      if (user) {
        response.status(400).json({ error: 'Already exist' });
      } else {
        const hashedPassword = sha1(password);
        users.insertOne(
          {
            email,
            password: hashedPassword,
          },
        ).then((result) => {
          response.status(201).json({ id: result.insertedId, email });
        }).catch((error) => console.log(error));
      }
    });
  },

  async getMe(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    console.log(` our ${userId}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const objectid = new ObjectID(userId);
    const user = await dbClient.client.db().collection('users').findOne({ _id: objectid });
    console.log(user);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userResponse = {
      id: user._id,
      email: user.email,
    };

    return res.status(200).json(userResponse);
  },

};
export default UsersController;
