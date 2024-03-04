/* basic server configuration */
const env = require('dotenv');
env.config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require("helmet");
const app = express();
const path = require("path")
const cors = require("cors")
const corsOptions = {
    origin: '*',
  };
app.use(cors(corsOptions));

/* Middlewares to use */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(helmet());

/*  Import required Routes*/
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const amenityRoutes = require("./routes/amenityRoutes");
const stayRoutes = require("./routes/stayRoutes");
const commonRoutes = require("./routes/commonRoutes");

/* using imported routes */
app.use(authRoutes);
app.use(propertyRoutes);
app.use(amenityRoutes);
app.use(stayRoutes);
app.use(commonRoutes);

/* Environment variables */
const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI

/* Listening PORT configuration */
app.listen(PORT, () => {
    console.log(` Backend listening on port : ${PORT} \n http://127.0.0.1:5000/`);
});

app.get("/",(req,res)=>{
    res.send("<h1>Hello From Dream Care Developers</h1>")
});
app.get('/assets/images/:user_id/:imagePath', async (req, res) => {
    const { user_id, imagePath } = req.params;
    res.sendFile(path.join(__dirname,"uploads",user_id,imagePath));
})

/* Database Configuration */
mongoose.set('strictQuery', true)
mongoose.connect(DB_URI).then(connected => {
    console.log(" Connected to mongoDB")
}).catch(err => {
    console.log(" DB Error : ", err)
})