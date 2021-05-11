require("dotenv").config();
const express = require("express");
const Busboy = require("busboy");
const fs = require("fs");
const { nanoid } = require("nanoid");
const app = express();
const port = process.env.PORT;

let files = [];

fs.rmdirSync(__dirname + "/files", { recursive: true });
fs.mkdirSync(__dirname + "/files");

app.use(express.static("public"));

app.get("/api/:id/download", (req, res) => {
  let id = req.params.id;

  if (files[id]) {
    res.on("finish", () => {
      fs.unlink(__dirname + "/files/" + id);
    });
    return res.download(__dirname + "/files/" + id, files[id].name);
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
    if (files[id].uploaded) return res.sendStatus(400);

    let busboy = new Busboy({ headers: req.headers });

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      files[id].name = filename;
      file.pipe(fs.createWriteStream(__dirname + "/files/" + id));
    });

    busboy.on("finish", () => {
      files[id].uploaded = true;
      res.send(files[id]);
    });

    return req.pipe(busboy);
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
