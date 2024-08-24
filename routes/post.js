const router = require("express").Router();
const Post = require("../models/Posts");
const User = require("../models/User");

//create post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    await newPost.save();
    res.status(200).json({
      status: "success",
      message: "You just posted.",
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
});

//update post
router.put("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post.userId === req.body.userId) {
    try {
      await post.updateOne(req.body);
      res.status(200).json({
        status: " success",
        message: "Your post has been updated successfully.",
      });
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  } else {
    res.status(500).json({
      status: "failed",
      message: "You can update only your posts.",
    });
  }
});

//delete post
router.delete("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post.userId === req.body.userId) {
    try {
      await post.deleteOne();
      res.status(200).json({
        status: " success",
        message: "Your post has been deleted successfully.",
      });
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  } else {
    res.status(500).json({
      status: "failed",
      message: "You can delete only your posts.",
    });
  }
});

//like-dislike post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json({
        status: " success",
        message: "The post has been liked",
      });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json({
        status: " success",
        message: "The post has been disliked",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
});

// get Timeline post
router.get("/timeline/:userId", async (req, res) => {
  try {
    // console.log(112);
    const currUser = await User.findById(req.params.userId);
    // console.log(currUser);
    const userPosts = await Post.find({ userId: currUser._id });
    // console.log(userPosts);

    // iterate over following array and find relevent posts
    const friendPosts = await Promise.all(
      currUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    // console.log(friendPosts);

    //merge both post array
    const response = userPosts.concat(...friendPosts);
    // console.log(response);
    res.status(200).json({
      status: "success",
      length: response.length,
      data: response,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
});
// get User's all post
router.get("/profile/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId });

    // console.log(posts);
    // console.log("user's posts only.");
    res.status(200).json({
      status: "success",
      length: posts.length,
      data: posts,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
});

//get post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
});

module.exports = router;
