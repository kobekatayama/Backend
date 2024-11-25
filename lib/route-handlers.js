import express from "express"
import dotenv from "dotenv"
import sgMail from "@sendgrid/mail"

// import { database } from "./in-memory-database.js"
import { database } from "./persistent-database.js"

const router = express.Router()

// configs for sendgrid and credentials
dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// configs for form-based file uploads
import multer from "multer"
const upload = multer({ dest: "uploads/" })

// Home route
router.get("/", async (req, res) => {
  try {
    const subscribers = await database.getSubscribers()
    res.render("home", { subscribers })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})
// Subscribe route
router.get("/subscribe", async (req, res) => {
  try {
    const subscribers = await database.getSubscribers()
    res.render("subscribe", { subscribers })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})
// Create subscriber route
router.post(
  "/subscribers/create",
  upload.single("avatar"),
  async (req, res) => {
    const subscriberData = {
      ...req.body,
      file: req.file ? req.file.filename : null,
    }
    try {
      await database.addSubscriber(subscriberData)
      res.redirect("/")
    } catch (error) {
      console.error(error)
      res.status(500).send("Internal Server Error")
    }
  }
)
// Delete subscriber route
router.post("/subscribers/delete/:id", async (req, res) => {
  try {
    await database.removeSubscriber(req.params.id)
    res.redirect("/")
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})
// Favorite subscriber route
router.post("/subscribers/favorite/:id", async (req, res) => {
  try {
    await database.favoriteSubscriber(req.params.id)
    res.redirect("/")
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})
// Newsletter signup form route
router.get("/newsletter", (req, res) => {
  res.render("newsletter")
})
// Newsletter signup API
router.post("/api/newsletter-signup", async (req, res) => {
  const { email } = req.body
  const msg = {
    to: email,
    from: "mmontoya@masters.edu", // Replace with your verified SendGrid sender email
    subject: "Thanks for subscribing!",
    text: "Thank you for signing up for our newsletter!",
    html: "<strong>Thank you for signing up for our newsletter!</strong>",
  }
  try {
    await sgMail.send(msg)
    res.render("newsletter", { message: "Subscription successful!" })
  } catch (error) {
    console.error(error)
    res.render("newsletter", {
      message: "Error subscribing. Please try again.",
    })
  }
})

// Route for CSRF token (when needed)
router.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

router.post("/api/journal-signup", async (req, res) => {
  const { email } = req.body
  const msg = {
    to: email,
    from: "mmontoya@masters.edu", // Replace with your verified SendGrid sender email
    subject: "Thanks for subscribing!",
    text: "Thank you for signing up for our newsletter!",
    html: "<strong>Thank you for signing up for our newsletter!</strong>",
  }
  try {
    await sgMail.send(msg)
    res.send({ message: "Subscription successful!" })
  } catch (error) {
    console.error(error)
    res.send({
      message: "Error subscribing. Please try again. " + error,
    })
  }
})

export default router
