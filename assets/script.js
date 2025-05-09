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


    document.getElementById('status').innerHTML = "Loaded "+products.length+" products. <span onclick='document.getElementById(`raw`).style.display = `block`;this.remove()' style='text-decoration:underline;'>View Raw</span>"

    document.getElementById('raw').innerHTML = JSON.stringify(products)
    window.localStorage.setItem('usedCache', JSON.stringify(products))

    //setupPageRender(products)
}

async function printPage(){
    await setupPageRender(JSON.parse(window.localStorage.getItem('toPrint')))

    print()
}

async function printUsed(location){
    if(!location){
        return
    }

    products = await getUsed()

    toPrint = []
    i = 0
    while(i<products.length){
        if(products[i].location == location){
            toPrint.push(products[i])
        }
        i++
    }

    window.localStorage.setItem('toPrint',JSON.stringify(toPrint))


}

async function sendPrint(){

    window.open('./printpage.html');
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

async function addItem(index){
    csProducts = window.localStorage.getItem('csProducts') || '[]'

    csProducts = JSON.parse(csProducts)

    csProducts.push(index)
    elem = document.getElementById('productSelector')
    
    elem.children[index].children[0].value = "Remove"

    elem.children[index].children[0].setAttribute('onclick', `removeItem(${index})`)

    window.localStorage.setItem('csProducts', JSON.stringify(csProducts))

    products = await getUsed()
    csString = document.getElementById('csProducts')
    csString.innerHTML = ""

    i = 0
    while(i<csProducts.length){
        newelm = document.createElement("span")
        newelm.innerHTML = products[csProducts[i]].name

        csString.appendChild(newelm)
        i++
    }

    if(csProducts.length >3){
        document.getElementById('manyProdNotice').style.display = "block"
    }else{
        document.getElementById('manyProdNotice').style.display = "none"
    }
}

async function removeItem(index){
    csProducts = window.localStorage.getItem('csProducts') || '[]'

    csProducts = JSON.parse(csProducts)

    i = 0
    while(i<csProducts.length){
        if(csProducts[i] == index){
            csProducts.splice(i, 1)
        }
        i++
    }
    elem = document.getElementById('productSelector')
    
    elem.children[index].children[0].value = "Add"

    elem.children[index].children[0].setAttribute('onclick', `addItem(${index})`)

    window.localStorage.setItem('csProducts', JSON.stringify(csProducts))

    products = await getUsed()
    csString = document.getElementById('csProducts')
    csString.innerHTML = ""

    i = 0
    while(i<csProducts.length){
        newelm = document.createElement("span")
        newelm.innerHTML = products[csProducts[i]].name

        csString.appendChild(newelm)
        i++
    }

    if(csProducts.length >3){
        document.getElementById('manyProdNotice').style.display = "block"
    }else{
        document.getElementById('manyProdNotice').style.display = "none"
    }
}

async function confirmSelectedItems(){
    csProducts = window.localStorage.getItem('csProducts') || '[]'

    csProducts = JSON.parse(csProducts)

    products = await getUsed()
    
    toPrint = []
    i = 0
    while(i<csProducts.length){
        toPrint.push(products[csProducts[i]])
        i++
    }

    window.localStorage.setItem('toPrint', JSON.stringify(toPrint))

    document.getElementById('prodsel').style.display = "none"

    document.getElementById('printDetails').style.display = "flex"
}

async function setupProductSelector(){
    products = await getUsed()
    elem = document.getElementById('productSelector')

    i = 0
    while(i<products.length){
        newdiv = document.createElement('div')

        newcheckbox = document.createElement('input')

        newcheckbox.setAttribute('type',"button")
        newcheckbox.value = "Add"
        newcheckbox.setAttribute("onclick", `addItem(${i})`)

        newdiv.appendChild(newcheckbox)

        newtitle = document.createElement('span')
        newtitle.classList.add('h3')

        newtitle.setAttribute('onclick',`this.parentElement.children[0].click()`)

        newtitle.innerHTML = products[i].name + ` (${await priceFormat(products[i].price)}, ${products[i].location})`

        newdiv.appendChild(newtitle)
        elem.appendChild(newdiv)
        i++
    }

    document.getElementById('prodsel').style.display = 'flex'
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

        //for location
        newlocation = document.createElement("span")
        newlocation.classList.add('h3')
        newlocation.innerHTML = list[i].location

        newinfocol.appendChild(newlocation)

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

    document.getElementById('pageHeader').innerHTML = localStorage.getItem('pageHeader')

    return
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