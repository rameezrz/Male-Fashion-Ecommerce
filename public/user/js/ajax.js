const form = document.getElementById('checkoutForm')

form.addEventListener('submit',(e) => {
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkoutForm').serialize(),
        success: (response) => {
            console.log(response);
            console.log("helloo from ajax");
            if(response){
                location.href='/shop'
            }
        }
    })
})