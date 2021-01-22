

async function sendForm(){
    const form = document.querySelector('#productForm')
    const form_data = getFormData(form)
    console.log(JSON.stringify(form_data))
    try {
        const res = await fetch('https://6fzuta5sbf.execute-api.us-east-1.amazonaws.com/default/return-customer-request',
        {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(form_data)
        })
        console.log(res)
        console.log(res.body)
        if (res.status === 200){
            // window.location = '/return_process.html'
            console.log('success')
        }
        else{
            console.log('error')
        }
        
    } catch (error) {
        console.log(error)
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


