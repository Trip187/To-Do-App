/* describe("some feature", function runBefore() {
  before(function runBefore() {
    console.log("running before functions...");
  });
  it("should test A", function () {
    //test A
    console.log("test A");
  });
  it("should test B", function () {
    //test B
    console.log("test B");
  });

  In a similar way, you can also specify a function to be executed after all the tests are done:
  describe('some feature', function() {
  
  after(function runAfter() {
    console.log('running after function...');  });

  it('should do A', function() {
    console.log('test A');
  });

  it('should do B', function() {
    console.log('test B');
  });

  A function 
can also be defined to be called before (or after) each and every test in the block, using the beforeEach and afterEach keywords respectively. Sample usage of the beforeEach keyword is as follows:

  describe('some feature', function() {
  
  beforeEach(function runBeforeEach() {
    console.log('running beforeEach function...');  });

  it('should do A', function() {
    console.log('test A');
  });

  it('should do B', function() {
    console.log('test B');
  });
});
});
}); */

//test groups
/*
describe("Feature A", function () {
  before(function () {
    console.log("running before function A...");
  });
  after(function () {
    console.log("running after function A...");
  });
  beforeEach(function () {
    console.log("running beforeEach function A...");
  });

  afterEach(function () {
    console.log("running afterEach function...");
  });

  describe("Feature A.1", function () {
    before(function () {
      console.log("running before functions for Feature A.1");
    });
    after(function () {
      console.log("running after functions for Feature A.1");
    });
    beforeEach(function () {
      console.log("running beforeEach function for Feature A.1");
    });
    afterEach(function () {
      console.log("running afterEach function for Feature A.1");
    });
    it("should do A.1.1", function () {
      console.log("test A.1.1");
    });
    it("should do A.1.2", function () {
      console.log("test A.1.2");
    });
  });
});
*/
require("dotenv").config();
const Cloudant = require("@cloudant/cloudant");

const cloudant = Cloudant({
  url: `https://${process.env.CLOUDANT_HOST}`,
  plugins: { iamauth: { iamApiKey: process.env.CLOUDANT_APIKEY } },
});

const db = cloudant.db.use("users");

db.get("iangkarari@gmail.com", function (err, doc) {
  if (err) {
    console.log("ERROR:", err);
  } else {
    console.log("FOUND:", doc);
  }
});
