async function receivedData(json){

    rows = json.rows

    products = []
    
    i = 0
    while(i<rows.length){

        products.push({
            name:rows[i].c[0].v,
            price:rows[i].c[1].v,
            location:rows[i].c[2].v,
            image:rows[i].c[3].v,
        })
        i++
    }

    setupPageRender(products)
}

async function priceFormat(price){
    price = parseInt(price)
    if(Math.floor(price) != price){
        price = `$${price}.00`
    }else{
        price = `$${price}`
    }

    return price
}

async function setupPageRender(list){
    listelem = document.getElementById('productList')
    i = 0
    while(i<list.length){
        newcontainer = document.createElement("div")
        newcontainer.classList.add('productContainer')

        //for img
        newimg = document.createElement("img")
        newimg.src = list[i].image
        newimg.width = "300"

        newcontainer.appendChild(newimg)

        //new info col
        newinfocol = document.createElement("div")
        newinfocol.classList.add('infoCol')
        
        newcontainer.appendChild(newinfocol)

        //for title
        newtitle = document.createElement("span")
        newtitle.classList.add('h2')
        newtitle.innerHTML = list[i].name

        newinfocol.appendChild(newtitle)

        //for price
        newprice = document.createElement("span")
        newprice.classList.add('h1')
        newprice.style.color = "red"
        newprice.innerHTML = await priceFormat(list[i].price)

        newinfocol.appendChild(newprice)

        listelem.appendChild(newcontainer)
        i++
    }
}

async function setOffsiteUsed(products){
    window.localStorage.setItem('usedCache', JSON.stringify(products))

    await setupPageRender(products)
}


async function getOffsiteUsed(){
    function reqListener(){
        jsonString = this.responseText.match(/(?<="table":).*(?=}\);)/g)[0]

        json = JSON.parse(jsonString)

        receivedData(json)
    }

    id = '1B61irJjmPDixXwRg7jAiUGEiNT5KGEmS4cgjaKqo9Qk'

    gid = '0'

    url = "https://docs.google.com/spreadsheets/d/"+id+"/gviz/tq?tqx=out:json&tq&gid="+gid

    oReq = new XMLHttpRequest()
    oReq.onload = reqListener
    
    oReq.open("get", url, true)

    try{
        oReq.send()
    }catch(err){
        alert("An error occurred while fetching data, ",err)
    }

    return
}

async function getUsed(x){
    if(x){
        data = await getOffsiteUsed()
    }else{
        cache = window.localStorage.getItem('usedCache')

        if(cache){
            data = JSON.parse(cache)
        }else{
            data = await getOffsiteUsed()
        }
        
    }

    return data
}