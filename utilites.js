const fs = require('fs')

function getAvailableSelectedProduct(inputQuery){
    let products = {}
    for ([k,v] of Object.entries(inputQuery)){
        if (k.includes('_')){
            const [obj_type, obj_id] = k.split('_')
            if (!products.hasOwnProperty(obj_id)) {
                Object.assign(products, {[obj_id]: {}}) 
            }
            Object.assign(products[obj_id], {[obj_type]: v})

        }
    }
    let available_products = []
    for (prop in products){
        const item_qty = parseInt(products[prop].itemQty, 10) || 0
        // condition where select_item quatity must >= 1
        if (item_qty >= 1){
            let prod_obj = products[prop]
            prod_obj.itemID = prop
            available_products.push(prod_obj)
        }
    }
    return available_products
}

async function imageUploader(req, shop, order){
    try {
        for (let i = 0; i<req.files.length; i++){
          const response = await fetch('https://jejo3xau5m.execute-api.us-east-1.amazonaws.com/default/return-app-getPresignedURL',
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({image_name: req.files[i].originalname, 
                                  image_type: req.files[i].mimetype, 
                                  store_name:shop,
                                  store_order:order
                                  })
          })
          if (response.status === 200){
            const {uploadURL} = await response.json()
            const result = await fetch(uploadURL, {
              method: 'PUT',
              headers: {
                'Content-Type': req.files[i].mimetype,
              },
              body: Uint8Array.from(fs.readFileSync(req.files[i].path)).buffer,
            })
            if (result.status === 200)
            { 
              // delete the temporary stored file
              fs.unlink(req.files[i].path, (err)=>{
                if(err){
                  throw err
                }
              })
            }
            else{ throw 'Error when uploading file to S3' }
          }
          else{ throw 'Not able to get PreSigned URL'}
    
        }
    
      } catch (error) {
        return {status: 500, msg: error}   
      }
    
    return {status: 200, msg: 'OK'}  

}

module.exports = {
    getAvailableSelectedProduct,
    imageUploader
}