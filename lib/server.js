import express from "express"
import { engine } from "express-handlebars"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import router from "./route-handlers.js"
import csrf from "csurf"
import cors from "cors"
const PORT = process.env.PORT || 3000
const app = express()

// Handlebars setup
app.engine("hbs", engine({ extname: ".hbs" }))
app.set("view engine", "hbs")
app.set("views", "views")

// Middleware for public files, form data, and API requests
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: false }))

// Apply CSRF protection
app.use(cookieParser())
const csrfProtection = csrf({ cookie: true })
app.use(csrfProtection)

app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
)
// Route handlers
app.use("/", router)
app.use("/subscribe", router)
app.use("/subscribers/create", router)
app.use("/subscribers/delete/:id", router)
app.use("/subscribers/favorite/:id", router)
app.use("/newsletter", router)
app.use("/api/newsletter-signup", csrfProtection, router)

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})
