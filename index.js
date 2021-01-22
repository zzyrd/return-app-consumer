
// const express = require('express')
// const app = express()

// app.get('/', (req, res) =>{
//     console.log(req.query)
//     // console.log(req.headers)
//     console.log(req.url)
//     // res.set('Content-Type','application/liquid')
//     // res.send('This is from express.js')
    
//     res.sendFile(__dirname + '/html/index.html');
    
// })


// app.listen(3000, () => {
//     console.log('App listening on port 3000!');
// });

const path = require("path");
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// app.use(express.static(path.join(__dirname, "..", "build")))
// add middleware for adding js and css files all together
// app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    // console.log(req.query)
    // res.set('Content-Type','application/liquid')  // use for shopify theme
    
    // console.log(path.join(__dirname, "public", "index.html"))
    console.log('main page')
    res.sendFile(path.join(__dirname, "html", "index.html"))
})

app.get('/error', (req, res) => {
  // console.log(req.query)
  // res.set('Content-Type','application/liquid')  // use for shopify theme
  
  // console.log(path.join(__dirname, "public", "index.html"))
  console.log(error page)
  res.sendFile(path.join(__dirname, "html", "return_process.html"))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})