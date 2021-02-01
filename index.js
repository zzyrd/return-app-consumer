require('isomorphic-fetch')
require('dotenv').config()
const {landingPageRender, processPageRender} = require("./pageRender")
const {verify_shopify} = require("./shopifyAuth")
const {getAvailableSelectedProduct, imageUploader} = require("./utilites")
const path = require("path")
const Handlebars = require("handlebars")
const fs = require('fs')
const bodyParser = require('body-parser')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const moment = require('moment')
const express = require('express')
const app = express()

const port = process.env.PORT || 3000

// add bodyparser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/healthCheck', (req, res)=>{
  res.status(200).json({msg:'OK'})
})
// handle index page
app.get('/', verify_shopify, (req, res) => {
  const file_path = path.join(__dirname, "public", "index.html")
  fs.readFile(file_path, 'utf8', (err, file)=>{
    if (err){
      console.log(err)
      res.status(500).send('Internal Server Error')
      return
    }
    const template = Handlebars.compile(file)
    const data = {"shop": req.query.shop, "url_path": req.query.path_prefix+"/"}
    const result = template(data)
    res.set('Content-Type','application/liquid')  // use for shopify theme
    res.send(result)
  })
   
})

// handle request from index -> return landing
app.post('/', verify_shopify, async (req, res)=>{
  // make api request to DynamoDB
  try {
    const db_res = await fetch('https://6fzuta5sbf.execute-api.us-east-1.amazonaws.com/default/return-customer-request',
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(req.body)
    })
    const db_data = await db_res.json()
    const {access_token, return_histories} = db_data
    const d = return_histories[0] // only one return record for
    const file_path = path.join(__dirname, "public", "return_landing.html")
    fs.readFile(file_path, 'utf8', async (err, file)=>{
        if (err){
          console.log(err)
          res.status(500).send('Internal Server Error - cannot open landing file')
          return
        }
        // start render the html file
        const template = Handlebars.compile(file)
        const data = await landingPageRender(d, access_token, req)
        if (!data){
          console.log('GraphQL fetch error or Empty lineItems from the result')
          res.status(500).json("Internal Server Error - Please try again later")
        }
        else{
          const result = template(data)
          res.set('Content-Type','application/liquid')
          res.send(result)
        }
    })   
  } catch (error) {
    console.log(error)
    res.status(500).json("Internal Server Error")
  } 

})

// handle request from return landing -> return process
app.post('/:order', verify_shopify, (req, res) => {
  const selected_products = getAvailableSelectedProduct(req.body)
  const file_path = path.join(__dirname, "public", "new_return.html")
  fs.readFile(file_path, 'utf8', (err, file)=>{
    if (err){
      console.log(err)
      res.status(500).send('Internal Server Error - cannot open return process file')
      return
    }
    // start render the html file
    const template = Handlebars.compile(file)
    const data = processPageRender(selected_products, req)
    const result = template(data)
    res.set('Content-Type','application/liquid')
    res.send(result)
  })
})

// handle request from return process -> return finish
app.post('/:order/finish', verify_shopify, upload.any(), async (req, res) => {
  const {shop} = req.query
  const {order} = req.params
  const selected_products = getAvailableSelectedProduct(req.body)

  // Step 1: update the DynamoDB record
  const fetch_res = await fetch("https://ccfqpjwpr5.execute-api.us-east-1.amazonaws.com/default/return-app-update-dynamoDB",
  {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({customer: req.body.customer, 
                          orderID: order, 
                          shop:shop,
                          request_date: moment().format(),
                          email:req.body.email,
                          reason:req.body.Q1 || "not specified",
                          items:selected_products
                          })
  })
  const step_1 = fetch_res.status === 200 

  // Step 2: get s3 presigned url and upload image files to s3 bucket
  const result = await imageUploader(req, shop, order)
  const step_2 = result.status === 200

  if (step_1 && step_2){
    res.set('Content-Type','application/liquid')
    res.sendFile(path.join(__dirname, "public", "success.html"))
  }
  else{
    if (!step_1) console.log('Failed to update DynamoDB')
    if (!step_2) console.log('Failed to upload images to S3 bucket')
    res.set('Content-Type','application/liquid')
    res.sendFile(path.join(__dirname, "public", "error.html"))
  }
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})