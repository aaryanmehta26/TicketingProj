import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";

// telling typescript, there is signup property
declare global {
  var getCookie: () => Promise<string[]>;
}

let mongo: any;

// before All run before our test
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

// beforeEach run before each test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  // reset all data in mongo collections
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// afterall run, after all tests complete
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.getCookie = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  const cookie = response.get("Set-Cookie");

  return cookie;
};
