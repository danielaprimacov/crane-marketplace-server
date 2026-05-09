const authService = require("../services/auth.service");
const { toAuthUserDto } = require("../dtos/user.dto");

async function signup(req, res, next) {
  try {
    const { user, token } = await authService.signupUser(req.body);

    res.status(201).json({ token, user: toAuthUserDto(user) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.loginUser(req.body);

    res.status(200).json({ token, user: toAuthUserDto(user) });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  try {
    const user = await authService.getAuthenticatedUser(req.payload._id);

    res.status(200).json({ user: toAuthUserDto(user) });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login, verify };
