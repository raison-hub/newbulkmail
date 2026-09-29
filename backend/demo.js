const fileInput=document.getElementById("fileInput")


fileInput.addEventListener("change",function(event){
    const file= event.target.files[0]
    crossOriginIsolated.log(file)

    const reader= new FileReader()

})
