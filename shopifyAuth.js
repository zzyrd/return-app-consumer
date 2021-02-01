const crypto = require('crypto')
const {SHOPIFY_API_SECRET} = process.env

function verify_shopify(req, res, next){
    const {signature} = req.query 
    delete req.query.signature
    const query_string = Object.entries(req.query).sort().reduce((acc,cur)=>{return acc + cur[0]+'='+cur[1]}, '')
    if (signature === crypto.createHmac('sha256', SHOPIFY_API_SECRET).update(query_string).digest('hex')){
      return next()
    }
    else{
      console.log('HMAC is incorrect')
      res.status(401)
      return res.send({msg: 'Not Authenticated'})
    }
  }

  module.exports = {
    verify_shopify
  }