import express from 'express';
import { createPost, getAllPosts, getPostById, likePost, deletePost } from '../controllers/postController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/', auth, createPost);
router.get('/paginated', getAllPosts);
router.get('/page/:page', getAllPosts);
router.get('/:postId', getPostById);
router.post('/:id/like', auth, likePost);
router.delete('/:postId', auth, deletePost);

export default router;