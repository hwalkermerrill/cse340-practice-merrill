//Constants on top
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const name = process.env.NAME || "NAME NOT SET";

//Respond with hello (env name)
app.get("/", (req, res) => {
  res.send(`Hello, ${name}!`);
});

// Methods
// >-- GET method route
app.get("/", (req, res) => {
  res.send("GET request to the homepage")
})
// >-- POST method route
app.post("/", (req, res) => {
  res.send("POST request to the homepage")
})
// >-- All method route
app.all("/secret", (req, res, next) => {
  console.log("Accessing the secret section ...")
  next() // pass control to the next handler
})

// Route to URL
// >-- Root
app.get("/", (req, res) => {
  res.send("root")
})
// >-- Specific (about)
app.get("/about", (req, res) => {
  res.send("about")
})
// >-- File (random.text)
app.get("/random.text", (req, res) => {
  res.send("random.text")
})

// Route match to strings
// >-- acd & abcd
app.get("/ab?cd", (req, res) => {
  res.send("ab?cd")
})
// >-- abcd, abbcd, abbbcd, and so on
app.get("/ab+cd", (req, res) => {
  res.send("ab+cd")
})
// >-- abcd, abxcd, abRANDOMcd, ab123cd, and so on
app.get("/ab*cd", (req, res) => {
  res.send("ab*cd")
})
// >-- abe and abcde
app.get("/ab(cd)?e", (req, res) => {
  res.send("ab(cd)?e")
})

//Expression routing
// >-- anything with an "a" in it
app.get(/a/, (req, res) => {
  res.send("/a/")
})
// >-- ends with "fly"
app.get(/.*fly$/, (req, res) => {
  res.send("/.*fly$/")
})
// >-- "bat" or "bet"
app.get("/b(at|et)/", (req, res) => {
  res.send("/b(at|et)/")
})

// Passing routes from one handler to another
app.get("/example/b", (req, res, next) => {
  console.log("the response will be sent by the next function ...")
  next()
}, (req, res) => {
  res.send("Hello from B!")
})

// Can also define and then call via array like:
// app.get("/example/c", [cb0, cb1, cb2])
// app.get("/example/d", [cb0, cb1], (req, res, next) => {

// app.route example
app.route("/book")
  .get((req, res) => {
    res.send("Get a random book")
  })
  .post((req, res) => {
    res.send("Add a book")
  })
  .put((req, res) => {
    res.send("Update the book")
  })

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})