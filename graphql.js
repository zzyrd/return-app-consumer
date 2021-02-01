
function retrieveOrders(orderID){
    return JSON.stringify({
        query:`query {
            orders(first:1, query:"name:#${orderID}"){
              edges {
                node {
                  name  
                  customer {
                    displayName
                    email
                  }
                  lineItems(first:10){
                    edges{
                      node{
                        id
                        name
                        variantTitle
                        quantity
                        originalUnitPriceSet{
                          shopMoney{
                            amount
                            currencyCode
                          }
                        }
                        originalTotalSet{
                          shopMoney{
                            amount
                            currencyCode
                          }
                        }
                        image{
                          originalSrc
                        }    
                      }
                    }
                  }
                }
              }
            }
          }`
    })

}

module.exports = {
    retrieveOrders
}