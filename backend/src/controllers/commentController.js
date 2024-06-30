import Comment from '../models/comment';
import Post from '../models/post';
import logger from '../utils/logger';

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const comment = new Comment({
      content,
      author: req.user.id,
      post: postId
    });
    await comment.save();
    await post.addComment(comment._id);
    const populatedComment = await Comment.findById(comment._id).populate('author', 'username').lean();
    res.status(201).json(populatedComment);
  } catch (error) {
    logger.error(`Failed to create comment: ${error.message}`);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' }
      })
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post.comments);
  } catch (error) {
    logger.error(`Failed to fetch comments: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const removeCommentFromPost = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user.id && post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    await post.removeComment(commentId);
    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment removed successfully' });
  } catch (error) {
    logger.error(`Failed to remove comment: ${error.message}`);
    res.status(500).json({ error: 'Failed to remove comment' });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      logger.error('Comment not found');
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.likes.includes(req.user.id)) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    logger.error(`Failed to like/unlike comment: ${error.message}`);
    res.status(500).json({ error: 'Failed to like/unlike comment' });
  }
};