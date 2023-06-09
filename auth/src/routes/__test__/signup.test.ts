import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
});

it("return 400 on invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "bcwbcuwjbcow",
      password: "password",
    })
    .expect(400);
});

it("returns 400 on invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "p" })
    .expect(400);
});

it("returns 400 on missing email and password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ password: "password" })
    .expect(400);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com" })
    .expect(400);
});

it("disallows duplicate email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(400);
});

// this test only succes if signed in cookie session is false, its because Se-Cookie will come in https not http(test env)
it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
