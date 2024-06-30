import { createComment, getPostComments, removeCommentFromPost, likeComment } from '../src/controllers/commentController';
import Comment from '../src/models/comment';
import Post from '../src/models/post';
import logger from '../src/utils/logger';

jest.mock('../src/models/comment');
jest.mock('../src/models/post');
jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('Comment Controller', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      user: { id: 'mockUserId' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const mockPost = { _id: 'mockPostId', addComment: jest.fn() };
      const mockComment = {
        _id: 'mockCommentId',
        content: 'Test comment',
        author: 'mockUserId',
      };
      
      Post.findById.mockResolvedValue(mockPost);
      Comment.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockComment),
      }));
      Comment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockComment)
      });
  
      mockRequest.params.postId = 'mockPostId';
      mockRequest.body.content = 'Test comment';
  
      await createComment(mockRequest, mockResponse);
  
      expect(logger.error).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'mockCommentId',
        content: 'Test comment',
        author: 'mockUserId'
      }));
    });
  });

  describe('getPostComments', () => {
    it('should return comments for a post', async () => {
      const mockComments = [{ _id: 'comment1' }, { _id: 'comment2' }];
      const mockPost = {
        _id: 'mockPostId',
        comments: mockComments,
      };
      
      Post.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPost),
      });

      mockRequest.params.postId = 'mockPostId';

      await getPostComments(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(mockComments);
    });

    it('should return 404 if post not found', async () => {
      Post.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      mockRequest.params.postId = 'nonexistentId';

      await getPostComments(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });
  });  

  describe('removeCommentFromPost', () => {
    it('should remove a comment successfully', async () => {
      const mockPost = {
        _id: 'mockPostId',
        author: 'mockUserId',
        removeComment: jest.fn().mockResolvedValue({}),
      };
      const mockComment = {
        _id: 'mockCommentId',
        author: 'mockUserId',
      };
      
      Post.findById.mockResolvedValue(mockPost);
      Comment.findById.mockResolvedValue(mockComment);
      Comment.findByIdAndDelete.mockResolvedValue({});

      mockRequest.params.postId = 'mockPostId';
      mockRequest.params.commentId = 'mockCommentId';

      await removeCommentFromPost(mockRequest, mockResponse);

      expect(mockPost.removeComment).toHaveBeenCalledWith('mockCommentId');
      expect(Comment.findByIdAndDelete).toHaveBeenCalledWith('mockCommentId');
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Comment removed successfully' });
    });

    it('should return 404 if post not found', async () => {
      Post.findById.mockResolvedValue(null);

      mockRequest.params.postId = 'nonexistentId';
      mockRequest.params.commentId = 'mockCommentId';

      await removeCommentFromPost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should return 404 if comment not found', async () => {
      const mockPost = { _id: 'mockPostId' };
      
      Post.findById.mockResolvedValue(mockPost);
      Comment.findById.mockResolvedValue(null);

      mockRequest.params.postId = 'mockPostId';
      mockRequest.params.commentId = 'nonexistentId';

      await removeCommentFromPost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Comment not found' });
    });

    it('should return 403 if user is not authorized to delete the comment', async () => {
      const mockPost = {
        _id: 'mockPostId',
        author: 'differentUserId',
      };
      const mockComment = {
        _id: 'mockCommentId',
        author: 'differentUserId',
      };
      
      Post.findById.mockResolvedValue(mockPost);
      Comment.findById.mockResolvedValue(mockComment);

      mockRequest.params.postId = 'mockPostId';
      mockRequest.params.commentId = 'mockCommentId';

      await removeCommentFromPost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authorized to delete this comment' });
    });
  });

  describe('likeComment', () => {
    it('should like a comment successfully', async () => {
      const mockComment = {
        _id: 'mockCommentId',
        likes: [],
        save: jest.fn().mockResolvedValue({ _id: 'mockCommentId', likes: ['mockUserId'] }),
      };
      
      Comment.findById.mockResolvedValue(mockComment);

      mockRequest.params.commentId = 'mockCommentId';

      await likeComment(mockRequest, mockResponse);

      expect(mockComment.likes).toContain('mockUserId');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'mockCommentId',
        likes: ['mockUserId'],
      }));
    });

    it('should unlike a comment if already liked', async () => {
      const mockComment = {
        _id: 'mockCommentId',
        likes: ['mockUserId'],
        save: jest.fn().mockResolvedValue({ _id: 'mockCommentId', likes: [] }),
      };
      
      Comment.findById.mockResolvedValue(mockComment);

      mockRequest.params.commentId = 'mockCommentId';

      await likeComment(mockRequest, mockResponse);

      expect(mockComment.likes).not.toContain('mockUserId');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'mockCommentId',
        likes: [],
      }));
    });

    it('should return 404 if comment not found', async () => {
      Comment.findById.mockResolvedValue(null);

      mockRequest.params.commentId = 'nonexistentId';

      await likeComment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Comment not found' });
    });
  });
});