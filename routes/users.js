const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        res.status(500).json({
          status: "failed",
          message: "Password change failed",
        });
      }
    }
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      res.status(200).json({
        status: "success",
        message: "Account has been updated.",
      });
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  } else {
    res.status(403).json({
      status: "failed",
      message: "you can update only your id",
    });
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({
        status: "success",
        message: "Account has been deleted.",
      });
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  } else {
    res.status(403).json({
      status: "failed",
      message: "You can delete only your id.",
    });
  }
});

//get user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, isAdmin, updatedAt, ...others } = user._doc;
    res.status(200).json({
      status: "success",
      data: others,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
});
//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json({
      status: "success",
      data: friendList,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
});

//follow user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json({
          status: "success",
          message: "You are now following this account",
        });
      } else {
        res.status(403).json({
          status: "failed",
          message: "You already follow this account.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  } else {
    res.status(403).json({
      status: "failed",
      message: "You can't follow your own id.",
    });
  }
});

//unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json({
          status: "success",
          message: "Account hes been unfollowed.",
        });
      } else {
        res.status(403).json({
          status: "failed",
          message: "You don't follow this account.",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  } else {
    res.status(403).json({
      status: "failed",
      message: "You can't unfollow your own id.",
    });
  }
});

module.exports = router;
