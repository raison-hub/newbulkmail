const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongoose
  .connect("mongodb://john:john12345@cluster0-shard-00-00.o1rfi1z.mongodb.net:27017,cluster0-shard-00-01.o1rfi1z.mongodb.net:27017,cluster0-shard-00-02.o1rfi1z.mongodb.net:27017/bulkmail?ssl=true&replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority")
  .then(() => console.log("connected to db"))
  .catch((err) => console.log("failed to connect", err));

const credential = mongoose.model(
  "credential",
  new mongoose.Schema(
    {
      user: String,
      password: String,
    },
    { strict: false }
  ),
  "mails"
);

app.get("/", (req, res) => {
  res.send("Bulk Mail Backend is Running!");
});

app.post("/sendemail", async (req, res) => {
  const { msg, emailList = [] } = req.body;

  try {
    // Specifically finds the document that contains the password field
    const creds = await credential.findOne({ password: { $exists: true } });

    if (!creds || !creds.user || !creds.password) {
      console.error("No valid credentials document found in MongoDB.");
      return res.status(500).send(false);
    }

    const validEmails = emailList.filter(
      (email) => email && typeof email === "string" && email.includes("@")
    );

    if (validEmails.length === 0) {
      console.error("No valid recipient emails found in request.");
      return res.status(400).send(false);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: creds.user,
        pass: creds.password.replace(/\s+/g, ""), // strips any accidental spaces
      },
    });

    for (let i = 0; i < validEmails.length; i++) {
      await transporter.sendMail({
        from: creds.user,
        to: validEmails[i].trim(),
        subject: "A message from bulk mail app",
        text: msg,
      });
      console.log("Email sent to: " + validEmails[i].trim());
    }

    res.send(true);
  } catch (error) {
    console.error("Error sending emails:", error);
    res.send(false);
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => {
    console.log("server started");
  });
}

module.exports = app;