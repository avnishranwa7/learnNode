const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Fetched posts',
            posts,
            totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw err;
    }

    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw err;
    }

    const imageUrl = req.file.path.replace('\\', '/');
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title,
        imageUrl,
        content,
        creator: req.userId
    });

    try{
        await post.save();

        const user = await User.findById(req.userId);
        user.posts.push(post);

        await user.save();

        res.status(201).json({
            message: 'Post created successfully!',
            post,
            creator: {
                _id: user._id,
                name: user.name
            }
        });
    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try{
        const post = await Post.findById(postId);
        if(!post){
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw err;
        }

        res.status(200).json({
            message: 'Post fetched',
            post
        });
    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.updatePost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw err;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path.replace('\\', '/');
    }

    if (!imageUrl) {
        const error = new Error('No image picked.');
        error.statusCode = 422;
        throw err;
    }

    try{
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw err;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw err;
        }

        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }

        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;

        const result = await post.save();
        res.status(200).json({
            message: 'Post updated',
            post: result
        });
    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    try{
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw err;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw err;
        }

        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);

        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();

        res.status(200).json({ message: 'Post deleted' });
    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getStatus = async (req, res, next) => {
    try{
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: user.status
        });
    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.updateStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw err;
    }

    const updatedStatus = req.body.status;

    try{
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        user.status = updatedStatus;
        await user.save();

        res.status(200).json({
            message: 'Status updated',
            status: updatedStatus
        });
    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}