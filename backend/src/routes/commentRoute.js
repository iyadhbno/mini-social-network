import express from 'express';
import { createComment, getPostComments, removeCommentFromPost, likeComment } from '../controllers/commentController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/:postId', auth, createComment);
router.get('/:postId', getPostComments);
router.delete('/:postId/:commentId', auth, removeCommentFromPost);
router.post('/:commentId/like', auth, likeComment);

export default router;