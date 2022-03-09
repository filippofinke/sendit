require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const JSONdb = require("simple-json-db");
const nanoid = require("nanoid").nanoid;
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 1024 * 1024 * 50; // 50MB

const db = new JSONdb(path.join(__dirname, "database.json"));

app.use(cors());
app.use(express.static("public"));

app.get("/:id", (req, res) => {
  let id = req.params.id;

  let file = db.get(id);
  if (file) {
    return res.download(path.join(__dirname, "files", id), file.name);
  } else {
    return res.sendStatus(404);
  }
});

app.post("/:name", (req, res) => {
  let id = nanoid();

  let contentLength = req.header("Content-Length");
  if (contentLength > MAX_FILE_SIZE) {
    req.destroy();
    res.sendStatus(413);
  } else {
    let file = fs.createWriteStream(path.join(__dirname, "files", id));
    let size = 0;
    req
      .on("data", (data) => {
        size += data.length;
        if (size > MAX_FILE_SIZE) {
          req.destroy();
          file.close();
          fs.unlinkSync(path.join(__dirname, "files", id));
        } else {
          file.write(data);
        }
      })
      .on("end", () => {
        db.set(id, {
          name: req.params.name,
          createdAt: Date.now(),
        });
        res.send(id);
      });
  }
});

app.listen(PORT, () => {
  console.log(`send-it server listening on http://localhost:${PORT}`);
});
