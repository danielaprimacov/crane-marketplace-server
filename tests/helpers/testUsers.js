const request = require("supertest");
const app = require("../../app");

async function signupUser({
  name = "Test User",
  email = "user@test.com",
  password = "Test123456!",
} = {}) {
  const response = await request(app).post("/auth/signup").send({
    name,
    email,
    password,
  });

  return response;
}

async function loginUser({
  email = "user@test.com",
  password = "Test123456!",
} = {}) {
  const response = await request(app).post("/auth/login").send({
    email,
    password,
  });

  const token = response.body.authToken || response.body.token;

  return {
    response,
    token,
  };
}

async function createAndLoginUser(userData = {}) {
  await signupUser(userData);
  return loginUser(userData);
}

module.exports = {
  signupUser,
  loginUser,
  createAndLoginUser,
};
