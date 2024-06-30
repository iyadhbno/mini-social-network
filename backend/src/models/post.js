import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, { timestamps: true });

postSchema.methods.addComment = function(commentId) {
    this.comments.push(commentId);
    return this.save();
  };
  
  postSchema.methods.removeComment = function(commentId) {
    this.comments = this.comments.filter(comment => comment.toString() !== commentId.toString());
    return this.save();
  };

const Post = mongoose.model('Post', postSchema);

export default Post;