const {retrieveOrders} = require("./graphql")

async function landingPageRender(d, access_token, req){
    let data = {}
    let qty_checking_map = {}
    if (d){
        data = {"style_value": "show_block", "items":d.lineItems.map(i=>({
          "product":`<img src="${i.image_src}" alt="no image" class="product_image">` + `<p>${i.product_name}</p>` + `<p>${i.variantTitle}</p>`,
          "quantity": i.quantity,
          "price": '$' + i.price,
          "reason": i.reason,
          "status":i.status
        }))}
        // quantity records for past returned products
        for (let i of d.lineItems){
          if (i.requestId in qty_checking_map){
            qty_checking_map[i.requestId].quantity += parseInt(i.quantity)
          }
          else{
            qty_checking_map[i.requestId] = {quantity: parseInt(i.quantity)}
          }
        }
    }
    else{
      data.style_value = "hide_block"  // hide the return history section
    }
    // fetch shopify order data using shopify API here, do error check for order and email here
    const fetch_res = await fetch(`https://${req.query.shop}/admin/api/${process.env.API_VERSION}/graphql.json`,
    {method: 'POST', headers: {'Content-Type': 'application/json','X-Shopify-Access-Token': access_token}, body: retrieveOrders(req.body.inputOrder)})
    const shopify_data = await fetch_res.json()
    // error checking: if occurs, we couldn't proceed to return process
    if (fetch_res.status !== 200 || shopify_data.data.orders.edges.length === 0) return ""

    const {node} = shopify_data.data.orders.edges[0]  // only one record returned
    const lineItems = node.lineItems.edges
    data.orderID = node.name.slice(1)  // exclude # sign
    data.email = node.customer.email
    data.customer = node.customer.displayName
    let eligible_list = []
    for (const i of lineItems){
      let item = {
                  item_id: i.node.id.split('/').pop(),
                  prod_name: i.node.name,
                  variantTitle: i.node.variantTitle,
                  quantity: i.node.quantity,
                  unitPrice: i.node.originalUnitPriceSet.shopMoney.amount,
                  totalPrice: i.node.originalTotalSet.shopMoney.amount,
                  img_src: i.node.image.originalSrc,
                }
      // quantity check to make sure item>=1 can be returned
      if (item.item_id in qty_checking_map) item.quantity -= qty_checking_map[item.item_id].quantity
      
      // when quantity >= 1, we push it to eligible list
      if (item.quantity >= 1) eligible_list.push(item)
    }
    
    if (eligible_list.length === 0){
      data.eligible_items = []
      data.no_items_style = 'show_block'
      data.have_items_style = 'hide_block'
      return data
    }
    else{
      data.eligible_items = []
      data.no_items_style = 'hide_block'
      data.have_items_style = 'show_block'
      let products_str = ''
      for (let i of eligible_list){
        let option_str = ''
        for (let j=0; j<= i.quantity; j++){
          option_str += `<option value="${j}">${j}</option>` + '\n'
        }
        data.eligible_items.push({
          "product": `<img src="${i.img_src}" alt="no image" class="product_image">` + `<p>${i.prod_name}</p>` + `<p>${i.variantTitle}</p>`,
          "select_tag": `<select id="itemQty_${i.item_id}" name="itemQty_${i.item_id}"> ${option_str}</select>`
        })
        products_str += `<input type="hidden" name="img_${i.item_id}" value="${i.img_src}">` + '\n'
        products_str += `<input type="hidden" name="title_${i.item_id}" value="${i.prod_name}">` + '\n'
        products_str += `<input type="hidden" name="variant_${i.item_id}" value="${i.variantTitle}">` + '\n'
        products_str += `<input type="hidden" name="price_${i.item_id}" value="${i.totalPrice}">` + '\n'
      }
      data.product_details_cache = products_str
      data.next_route = req.body.inputOrder
      return data
    }

}

function processPageRender (products, req){
  let data = {}
  data = {"customer": req.body.customer,"orderID":req.body.orderID,
          "customer_email":req.body.email,
          "eligible_items":products.map(i=>({
            "product":`<img src="${i.img}" alt="no image" class="product_image">` + `<p>${i.title}</p>` + `<p>${i.variant}</p>`,
            "quantity": i.itemQty
          }))}
  let products_str = ''
  for (let prod of products){
      for (let p in prod){
          products_str += `<input type="hidden" name="${p+'_'+prod.itemID}" value="${prod[p]}">` + '\n'
      }
  }
  data.product_details_cache = products_str
  data.next_route = req.params.order + '/' + 'finish'
  if (!data.product_details_cache){
    data.no_item_selected = 'show_block'
    data.have_item_selected = 'hide_block'
  }
  else{
    data.no_item_selected = 'hide_block'
    data.have_item_selected = 'show_block'
  }
  
  return data

}

module.exports ={
    landingPageRender,
    processPageRender
}