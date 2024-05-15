const timeFinishField = document.getElementById('timeFinish')
const fieldsCheck = {
    timeFinish: false
}

let intervalID
let saleDataToUpdate = {
}

function setTitle(text){
    const title = document.getElementById('title')
    title.innerText = text
}

function setTagID(saleID){
    const tagID = document.querySelector('#saleIndex p')
    let numberZeros = 9 - (`${saleID}`.length), tagNumber = "#"

    if(numberZeros > 0){
        tagNumber = tagNumber.concat("0".repeat(numberZeros))
    }
    tagNumber = tagNumber.concat(`${saleID}`)
    tagID.textContent = tagNumber
}

function setFieldName(employeeName){
    const employee = document.getElementById('employee')
    employee.value = employeeName

    establecerCorrecto('employee', employee)
}

function setFieldRoute(routeName){
    const route = document.getElementById('route')
    route.value = routeName

    establecerCorrecto('route', route)
}

function setFieldDate(dateValue){
    const date = document.getElementById('date')
    date.value = dateValue

    establecerCorrecto('date', date)
}

function setFieldTimeStart(time){
    const timeStart = document.getElementById('timeStart')
    timeStart.value = time

    establecerCorrecto('timeStart', timeStart)
}

function setFieldTimeFinish(time){
    timeFinishField.value = time

    establecerCorrecto('timeFinish', timeFinishField)
}

function getCurrentTime() {
    let date = new Date()
    let hour = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    
    hour = hour >= 0 && hour < 10 ? `0${hour}` : `${hour}`
    minutes = minutes >= 0 && minutes < 10 ? `0${minutes}` : `${minutes}`
    seconds = seconds >= 0 && seconds < 10 ? `0${seconds}` : `${seconds}`

    return `${hour}:${minutes}:${seconds}`
}

function switchModeTime(checked){
    const lockTimeIcon = document.querySelector('.lock-field-icon')
    lockTimeIcon.classList.toggle('display-none')

    if (checked) {
        timeFinishField.readOnly = false
        clearInterval(intervalID)
        intervalID = 0
    } else {
        timeFinishField.readOnly = true

        if (intervalID == 0) {
            intervalID = setInterval(() => {
                setFieldTimeFinish(getCurrentTime())
            }, 1000);
        }
    }
}
    
async function getParams() {
    return await window.electronAPI.getParams("completingSaleParams")
}

async function getSaleDataById(id){
    return await window.electronAPI.selectSaleById(id)
}

async function init(){
    const checkTime = document.getElementById('checkTime')
    
    const params = await getParams()
    const saleDataFetched = await getSaleDataById(params.index)

    intervalID = 0

    setFieldName(saleDataFetched.nombre)
    setFieldRoute(saleDataFetched.ruta)
    setFieldDate(saleDataFetched.fecha)
    setFieldTimeStart(saleDataFetched.salida)

    switch (params.editingStatusOfCompletingSale) {
        case true:
            setTitle("Finalizar Venta")
            setTagID(params.index)
            switchModeTime(checkTime.checked)

            checkTime.addEventListener('click', () => {
                switchModeTime(checkTime.checked)
            })
            break;
    
        default:
            break;
    }
}

async function confirmToExit(goToSomewhere, swalIcon){
    await swal({
        icon: swalIcon,
        title: "¿Seguro que quiere salir?",
        text: 'Su avance se perderá :(',
        padding: '1.4rem',
        buttons: {
            cancel: {
                text: 'Cancelar',
                value: null,
                visible: true,
                closeModal: true
            },

            confirm: {
                text: "Aceptar",
                value: true,
                visible: true,
                closeModal: true
            }
        }
    }).then(async (value) => {
        switch (value) {

            case true:
                await goToSomewhere()
                break;
         
            default:
                break;
          }
    })
}

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navCompletedSales = document.getElementById('navCompletedSales')

    let goToSomeWhere;
    
    navHome.addEventListener('click', () => {
        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.home)
        }
        confirmToExit(goToSomeWhere, "warning")
    })

    navNewSale.addEventListener('click', () => {
        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.newSale)
        }
        confirmToExit(goToSomeWhere, "warning")
    })

    navCompletedSales.addEventListener('click', () => {
        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.completedSales)
        }
        confirmToExit(goToSomeWhere, "warning")
    })
})

init()