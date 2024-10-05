const express = require('express')
const cors = require('cors');
const app = express()
const router = require('./rootRouter')
const port = process.env.PORT || 3000
app.use(cors());

app.use(express.json())
app.use('/api/v1', router)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})