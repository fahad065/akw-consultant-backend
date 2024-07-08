require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
var timeout = require('connect-timeout')
const helmet = require("helmet");
const app = express();
const routes = require("./routes");
const path =require("path");
app.use('/v1/uploads', express.static(path.join(__dirname, 'uploads')));


mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('database connected'))

app.use(cors())
app.use(timeout('300s'))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(express.json())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(helmet());


app.disable('x-powered-by')
app.get('/', (req, res) => {
  res.send('Hello backend')
})




app.use("/v1", routes);
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
      return val;
  }

  if (port >= 0) {
      return port;
  }

  return false;
};

const port = normalizePort(process.env.PORT || "7000");
app.set("port", port);

const expressServer = app.listen(port, () => {
  console.log(`server running at port ${port}`)
})





