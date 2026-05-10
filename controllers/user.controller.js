const userService = require("../services/user.service");
const { toAuthUserDto } = require("../dtos/user.dto");

async function getProfile(req, res, next) {
  try {
    const user = await userService.getUserProfile(req.payload._id);

    res.status(200).json(toAuthUserDto(user));
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateUserProfile(req.payload._id, req.body);

    res.status(200).json(toAuthUserDto(user));
  } catch (error) {
    next(error);
  }
}

async function deleteProfile(req, res, next) {
  try {
    await userService.deleteUserProfile(req.payload._id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};
