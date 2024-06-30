import { createPost, getAllPosts, likePost, getPostById, deletePost } from '../src/controllers/postController';
import Post from '../src/models/post';
import Comment from '../src/models/comment';
import logger from '../src/utils/logger';

jest.mock('../src/models/post');
jest.mock('../src/models/comment');
jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('Post Controller', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      user: { id: 'mockUserId' },
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockPost = { 
        _id: 'mockPostId', 
        content: 'Test post',
        author: 'mockUserId'
      };
      
      Post.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockPost),
      }));
      Post.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPost)
      });

      mockRequest.body.content = 'Test post';

      await createPost(mockRequest, mockResponse);

      expect(logger.error).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'mockPostId',
        content: 'Test post',
        author: 'mockUserId'
      }));
    });
  });

  describe('getAllPosts', () => {
    it('should return paginated posts', async () => {
      const mockPosts = [{ _id: 'post1' }, { _id: 'post2' }];
      Post.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockPosts),
      });
      Post.countDocuments.mockResolvedValue(10);

      await getAllPosts(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        posts: mockPosts,
        currentPage: 1,
        totalPages: 1,
        totalPosts: 10,
      }));
    });
  });

  describe('likePost', () => {
    it('should like a post successfully', async () => {
      const mockPost = {
        _id: 'mockPostId',
        likes: [],
        save: jest.fn().mockResolvedValue({ _id: 'mockPostId', likes: ['mockUserId'] }),
      };
      
      Post.findById.mockResolvedValue(mockPost);

      mockRequest.params.id = 'mockPostId';

      await likePost(mockRequest, mockResponse);

      expect(mockPost.likes).toContain('mockUserId');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'mockPostId',
        likes: ['mockUserId'],
      }));
    });

    it('should unlike a post if already liked', async () => {
      const mockPost = {
        _id: 'mockPostId',
        likes: ['mockUserId'],
        save: jest.fn().mockResolvedValue({ _id: 'mockPostId', likes: [] }),
      };
      
      Post.findById.mockResolvedValue(mockPost);

      mockRequest.params.id = 'mockPostId';

      await likePost(mockRequest, mockResponse);

      expect(mockPost.likes).not.toContain('mockUserId');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'mockPostId',
        likes: [],
      }));
    });
  });

  describe('getPostById', () => {
    it('should return a post by id', async () => {
      const mockPost = { _id: 'mockPostId', content: 'Test post' };
      Post.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPost),
      });

      mockRequest.params.postId = 'mockPostId';

      await getPostById(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 404 if post not found', async () => {
      Post.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      mockRequest.params.postId = 'nonexistentId';

      await getPostById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      const mockPost = {
        _id: 'mockPostId',
        author: 'mockUserId',
        remove: jest.fn().mockResolvedValue({}),
      };
      
      Post.findById.mockResolvedValue(mockPost);
      Comment.deleteMany.mockResolvedValue({});

      mockRequest.params.postId = 'mockPostId';

      await deletePost(mockRequest, mockResponse);

      expect(Comment.deleteMany).toHaveBeenCalledWith({ post: 'mockPostId' });
      expect(mockPost.remove).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Post deleted successfully' });
    });

    it('should return 404 if post not found', async () => {
      Post.findById.mockResolvedValue(null);

      mockRequest.params.postId = 'nonexistentId';

      await deletePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should return 403 if user is not authorized to delete the post', async () => {
      const mockPost = {
        _id: 'mockPostId',
        author: 'differentUserId',
      };
      
      Post.findById.mockResolvedValue(mockPost);

      mockRequest.params.postId = 'mockPostId';

      await deletePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authorized to delete this post' });
    });
  });
});