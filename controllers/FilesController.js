import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'mongodb';
import * as fsp from 'fs/promises';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  async validateUser(request) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    try {
      const userId = await redisClient.get(key);
      console.log(`The user id is ${userId}`);

      if (userId) {
        const objectid = new ObjectID(userId);
        const user = await dbClient.client.db().collection('users')
          .findOne({ _id: objectid });

        if (!user) {
          return null;
        }
        return user;
      }
    } catch (error) {
    //   console.log(`Error in validate user: ${error}`);
      return null;
    }
    return null;
  },

  async postUpload(req, res) {
    const user = await FilesController.validateUser(req);
    console.log('post upload user...');
    console.log(user);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;
    console.log(`parent id is ${parentId}`);

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // const objectidparent = new ObjectID(parentId);
    // const parentIdset = await dbClient.client.db()
    // .collection('files').findOne({ _id: objectidparent });

    // if (!parentIdset) {
    //     return res.status(400).json({ error: "Parent not found" });
    // }
    // if (parentIdset.type !== "folder") {
    //     return res.status(400).json({ error: "Parent is not a folder" });
    // }

    // if (parentId !== "0") {
    //   const parentFile = await dbClient.client
    //     .db()
    //     .collection("files")
    //     .findOne({ parentId: parentId });
    //     console.log(parentFile);
    //   if (!parentFile) {
    //     return res.status(400).json({ error: "Parent not found" });
    //   }

    //   if (parentFile.type !== "folder") {
    //     return res.status(400).json({ error: "Parent is not a folder" });
    //   }
    // }

    const fileName = uuidv4();

    await fsp.mkdir(FOLDER_PATH, { recursive: true }).catch((err) => {
      console.error(`Error in mkdir: ${err}`);
    });
    const localPath = path.join(FOLDER_PATH, fileName);

    if (type !== 'folder') {
      const fileData = Buffer.from(data, 'base64');
      fs.writeFile(localPath, fileData, (err) => {
        if (err) {
          throw err;
        }
        console.log('Data saved successfully!');
      });
    }

    const newFile = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
      localPath: type !== 'folder' ? localPath : null,
    };

    try {
      const result = await dbClient.client
        .db()
        .collection('files')
        .insertOne(newFile);

      const {
        userId, name, type, isPublic, parentId,
      } = newFile;
      const createdFile = {
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      };

      return res.status(201).json(createdFile);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getShow(req, res) {
    const user = await FilesController.validateUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;

    const ObjectIduser = new ObjectID(id);
    const file = await dbClient.client
      .db()
      .collection('files')
      .findOne({ _id: ObjectIduser, userId: user.id });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  },
};

export default FilesController;
