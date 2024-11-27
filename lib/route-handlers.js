import express from "express"
import multer from "multer"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import csrf from "csurf"
import cors from "cors"
import dotenv from "dotenv"
import sgMail from "@sendgrid/mail"
import { database } from "./persistent-database.js" // or use "./in-memory-database.js"

const router = express.Router() // Create a router

/**
 * Mount Middleware
 */

// Public files, form data, JSON, CSRF protection, and CORS
router.use(express.static("public"))
router.use(bodyParser.urlencoded({ extended: false }))
router.use(express.json())
router.use(cookieParser())
const csrfProtection = csrf({ cookie: true })
router.use(
  cors({
    origin: true, // Allows any origin
    credentials: true,
  })
)

// Configure for multi-part, form-based file uploads
const upload = multer({ dest: "uploads/" })

// configs for sendgrid and credentials
dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/**
 * Route Definitions
 */

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
router.get("/subscribe", csrfProtection, async (req, res) => {
  const csrfToken = req.csrfToken()
  try {
    const subscribers = await database.getSubscribers()
    res.render("subscribe", { csrfToken, subscribers })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})

// Create subscriber route
router.post(
  "/subscribers/create",
  upload.single("avatar"),
  csrfProtection,
  async (req, res) => {
    console.log(req.body)
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
router.get("/newsletter", csrfProtection, (req, res) => {
  const csrfToken = req.csrfToken()
  res.render("newsletter", { csrfToken })
})

// Newsletter signup API
router.post("/api/newsletter-signup", csrfProtection, async (req, res) => {
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
router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// Route for API newsletter signup
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
