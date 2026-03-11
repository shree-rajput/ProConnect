import { User } from "../models/users.model.js";
import { Post } from "../models/posts.model.js";

export const activeCheck = async (req, res) => {
    return res.status(200).json({ message: "RUNNING" });
}

export const createPost = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }
        const post = await new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file !== undefined ? req.file.filename : "",
            fileType: req.file !== undefined ? req.file.mimetype.split("/")[1] : ""
        });

        await post.save();

        return res.status(200).json({ message: "post created successfully" })

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate("userId", "name username email profilePicture")
        return res.json({ posts });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}


export const deletePost = async (req, res) => {
    const { token, post_id } = req.body;

    try {
        const user = await User.findOne({ token: token }).
            select("_id");
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(400).json({ message: "Post not foud" });
        }

        if (post.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Post.findByIdAndDelete(post_id);
        return res.json({ message: "Post deleted sucessfully" });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
};

export const commentPost = async (req, res) => {
    let { token, post_id, commentBody } = req.body;

    try {
        const user = await User.findOne({ token: token }).select("_id");

        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const post = await Post.findOne({
            _id: post_id
        })
        if (!post) {
            return res.status(400).json({ message: "Post not found" });
        }
        const comment = new Comment({
            userId: user._id,
            postId: post_id,
            comment: commentBody
        })
        await comment.save();
        return res.status(200).json({ message: "comment added" });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}


export const get_comments_by_post = async (req, res) => {
    const { post_id } = req.body;
    try {
        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "post not found" });
        }

        return res.json({ comments: post.comments });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

export const delete_comment_of_user = async (req, res) => {
    const { token, post_id } = req.body;
    try {
        const user = await User.findOne({ token }).select("_id");
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const comment = await Comment.findOne({ "_id": comment_id });

        if (!comment) {
            return res.status(404).json({ message: "comment not found" })
        }
        await Comment.deleteOne({ "_id": comment_id });
        return res.json({ message: "comment deleted" });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

export const incrementLikes = async (req, res) => {
    const { post_id } = req.body;
    try {

        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        post.likes = post.likes + 1;

        await post.save();
        return res.json({ message: "Likes incremented" });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}