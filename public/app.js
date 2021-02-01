

     async function sendForm(){
        const form = document.querySelector('#productForm')
        const form_data = getFormData(form)
        try {
            const dir_path = document.getElementById('urlId').innerHTML
            const res = await fetch(dir_path, {
              method: 'POST',
              headers:{'Content-Type': 'application/json'},
              body: JSON.stringify(form_data)
            })
            if (res.status == 200){
              const res_data = await res.json()
              // redirect page
              window.location = res_data.path

            }
            else{
              console.log(res.status)
              document.getElementById('error_text').innerHTML = " Error code: " + res.status + "occurs"
              document.getElementById('error').style.display = 'block'
            }
            
        } catch (error) {
            console.log(error)
            document.getElementById('error_text').innerHTML = " Error occurs when fetching authentication data"
            document.getElementById('error').style.display = 'block'
        }

      }


// async function sendForm(){
//     const form = document.querySelector('#productForm')
//     const form_data = getFormData(form)
//     console.log(form_data)

//     try {
//         const res = await axios({
//             method: 'post',
//             url: 'https://6fzuta5sbf.execute-api.us-east-1.amazonaws.com/default/return-customer-request',
//             data:form_data,
//             headers:{'Content-Type': 'application/json'}
    
//         })
//         console.log(res)
//     } catch (error) {
//         console.log(error)
//     }

// }

// async function sendForm(){
//     try {
//         // const res = await fetch("https://jsonplaceholder.typicode.com/users")
//         // console.log(res)
//         // const data = await res.json()
//         // console.log(data)
//         const res = await axios.get("https://jsonplaceholder.typicode.com/users")
//         console.log(res)
//     } catch (error) {
//         console.log(error)
//     }

//     return 'hello'
// }


