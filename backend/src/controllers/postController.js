import Post from '../models/post';
import Comment from '../models/comment';
import logger from '../utils/logger';

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let post = new Post({ content, author: req.user.id });
    await post.save();
    const populatedPost = await Post.findById(post._id).populate('author', 'username').lean();
    res.status(201).json(populatedPost);
  } catch (error) {
    logger.error(`Failed to create post: ${error.message}`);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const posts = await Post.find().populate('author', 'username').populate({
      path: 'comments',
      populate: { path: 'author', select: 'username' }
    }).sort('-createdAt').skip(skip).limit(limit);
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);
    res.json({
      posts,
      currentPage: page,
      totalPages,
      totalPosts
    });
  } catch (error) {
    logger.error(`Failed to fetch posts: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    logger.error(`Failed to like/unlike post: ${error.message}`);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' }
      })
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    logger.error(`Failed to fetch post: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    await Comment.deleteMany({ post: postId });
    await post.deleteOne(); 
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error(`Failed to delete post: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};