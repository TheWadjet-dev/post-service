const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'mysql',
  logging: false,
});

// Post model
const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  }
});

// Ensure database connection
sequelize.sync()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));

// Create a new post
app.post('/posts', async (req, res) => {
  try {
    const { userId, content, imageUrl, linkUrl } = req.body;
    if (!userId || (!content && !imageUrl && !linkUrl)) {
      return res.status(400).json({ error: 'UserId and at least one post field (content, imageUrl, linkUrl) are required' });
    }
    const newPost = await Post.create({ userId, content, imageUrl, linkUrl });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AWS deployment setup (ECR, EBS)
const ecr = new AWS.ECR({ region: process.env.AWS_REGION });
const ebs = new AWS.ElasticBeanstalk({ region: process.env.AWS_REGION });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
