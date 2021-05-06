require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const { nanoid } = require("nanoid");
const app = express();
const port = process.env.PORT;

let files = [];

app.use(express.static("public"));

app.use(
  fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  })
);

app.get("/api/:id/download", (req, res) => {
  let id = req.params.id;

  if (files[id]) {
    res.setHeader(`Content-Disposition`, `attachment; filename="${files[id].name}"`);
    return res.sendFile(__dirname + "/files/" + id);
  } else {
    return res.sendStatus(404);
  }
});

app.get("/api/:id", (req, res) => {
  let id = req.params.id;

  if (files[id]) {
    return res.send(files[id]);
  } else {
    return res.sendStatus(404);
  }
});

app.post("/api/", (req, res) => {
  let id = nanoid();

  while (files[id]) id = nanoid();

  console.log(`# Reserved ${id}`);
  files[id] = {
    id: id,
    createdAt: new Date().getTime(),
  };

  return res.send(id);
});

app.post("/api/:id", (req, res) => {
  let id = req.params.id;

  if (files[id]) {
    if (req.files.file) {
      let file = req.files.file;
      files[id].name = file.name;
      file.mv(__dirname + "/files/" + id, (err) => {
        if (err) return res.status(500).send(err);
        return res.sendStatus(200);
      });
    } else {
      return res.sendStatus(400);
    }
  } else {
    return res.sendStatus(404);
  }
});
app.get("(/*)?", async (req, res, next) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.listen(port, () => {
  console.log(`send-it server listening on http://localhost:${port}`);
});
