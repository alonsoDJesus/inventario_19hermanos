const establecerCorrecto = (nameField, field) => {
    document.getElementById(`${nameField}__val`).classList.remove('opacity-0');
    document.getElementById(`${nameField}__val`).classList.add('opacity-1');
    document.getElementById(`${nameField}__val`).classList.remove('icon-wrong');
    document.getElementById(`${nameField}__val`).classList.add('icon-check');
    //document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.remove('formulario__input-error-activo');

    fieldsCheck[nameField] = true;
    field.parentNode.children[`${nameField}__warning`].classList.remove('formulario__input-error-activo')
}

// Señalización de entrada incorrecta de datos
const establecerIncorrecto = (nameField, field, errorMessage) => {
    // Se muestran iconos
    document.getElementById(`${nameField}__val`).classList.remove('opacity-0');
    document.getElementById(`${nameField}__val`).classList.add('opacity-1');

    // Se sustituye el ícono de correcto por el de incorrecto
    document.getElementById(`${nameField}__val`).classList.remove('icon-check');
    document.getElementById(`${nameField}__val`).classList.add('icon-wrong');

    fieldsCheck[nameField] = false; // En el objeto de los campos se señala una entrada incorrecta

    // Se uuestra el mensaje de error
    const warningMessage = field.parentNode.children[`${nameField}__warning`] // Se obtiene el elemento (en este caso un parrafo)
    warningMessage.classList.add('formulario__input-error-activo') // Se le agrega una clase que lo hace visible
    warningMessage.innerText = errorMessage // En su texto interior se le da un mensaje de error
}

// Regulador de la cantidad ingresada por el usario
function regulateQuantity(){
    try {
        quantity.value = quantity.value.replace('-', '') // Evita numeros negativos

        let product = searchProductByIdAttribute()
        if (quantity.value <= product.stock && quantity.value != '') { // Si no excede al stock
            // Afecta las cantidades de stock disponible y de cajas a enviar
            stock.value = product.stock - quantity.value
            boxes.value = Math.ceil(quantity.value / product.piecesInBox)

            // Señalizalo como correcto
            establecerCorrecto('quantity', quantity)
        }else{ // Pero si excede al stock...
            clearDataFromFields(false)
            setDataOnFields() // Se restablecen los datos de los campos

            let errorMessage
            quantity.value == '' ? errorMessage = "Campo vacío" : errorMessage = "Stock superado"
            establecerIncorrecto('quantity', quantity, errorMessage)
        }
    } catch (error) { // Si ocurre algun error, entonces
        if (error instanceof TypeError) {
            // sentencias para manejar excepciones TypeError
        } 
    }
}

function searchRepeatedSale(addedSales){
    let mySale = undefined, index = 1
    
    while (addedSales[index] != undefined) {
        if (productsDescription.selectedIndex == addedSales[index].Producto_FK__detalleventa) {
            mySale = addedSales[index]
        }

        index++
    }

    return mySale
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
                sessionStorage.removeItem("index")
                sessionStorage.removeItem("addedSales")
                await goToSomewhere()
                break;
         
            default:
                buttonSave.classList.remove('button_save_active')
                buttonCancel.classList.remove('button_cancel_active')
                break;
          }
    })
}

employees.addEventListener('change', () => {
    employees.selectedIndex != 0 ? establecerCorrecto('employees', employees) : establecerIncorrecto('employees', employees, 'Selecciona un empleado');
})

routes.addEventListener('change', () => {
    routes.selectedIndex != 0 ? establecerCorrecto('routes', routes) : establecerIncorrecto('routes', routes, 'Selecciona una ruta');
})

// Clic para seleccionar algun producto
productsDescription.addEventListener('change', () => {
    let modalFormFields = []
    modalFormFields.push(fields[5])
    clearValidations(modalFormFields[0].name, modalFormFields[0])
    // Si no está seleccionado ningun producto
    if (productsDescription.selectedIndex == 0) {
        establecerIncorrecto('description', productsDescription, 'Seleccione un producto válido') // Señalalo como incorrecto
        clearDataFromFields() // Limpia los datos de los campos
    }else{ // Si ha sido seleccionado algún producto, entonces...
        // Vamos a revisar si este producto que quiero seleccionar ya existe
        if (sessionStorage.length != 0) { // Si tengo elementos guardados en mi storage, entonces hay que revisar
            const auxAddedSales = JSON.parse(sessionStorage.getItem("addedSales")) // Obtengo esos elementos

            /* Comprobaré si el elemento que deseo agregar ya se encuentra en mi lista de ventas de la siguiente forma:
            - El criterio de busqueda será el selected index ya que es el valor que determina las claves del objeto de
            ventas registradas
            - Si al colocar selected index como criterio de búsqueda me sale un valor existente (algo que no sea indefined) 
            entonces quiere decir que si existe, por lo tanto, si hay intento de repetición de elemento
            - Si al colocar selected index como criterio de búsqueda me sale undefined, quiere decir  que no hay intento
            duplicación de registro
            
            Manos a la obra.. evaluemos ambos casos:*/
            if (searchRepeatedSale(auxAddedSales) != undefined) { // Caso 1: Si hay intento de reptición de registro
                establecerIncorrecto('description', productsDescription, 'Este producto ya está en tu lista de la venta')  // Señalalo como incorrecto
                clearDataFromFields() // Limpia los datos de los campos
            }else{ // Caso 2: no hay intento de duplicación de registro
                establecerCorrecto('description', productsDescription) // Señalalo como correcto

                /* Viene otra tarea: hay dos posibles casos cuando has seleccionado correctamente un producto:
                - Caso 1. El campo de la cantidad de elementos está vacío: Si es así solamente establece los datos en los campos
                - Caso 2. El campo de la cantidad de elementos tiene datos: Asegurate que ese numero no sobrepase el stock y actualiza las demas cantidades*/
                clearDataFromFields()
                setDataOnFields()
            }
        }else{ // Si no tengo elementos almacenados, no vale la pena buscar, simplemente...
            // Realiza lo mismo que se manejó en el caso 2 donde no hay intento de duplicación de registros
            establecerCorrecto('description', productsDescription) // Señalalo como correcto
            clearDataFromFields()
            setDataOnFields()

            let modalFormFields = []
            modalFormFields.push(fields[5])
            clearValidations(modalFormFields[0].name, modalFormFields[0])
        }
    }
});

// Cada vez que el usuario escriba una cantidad
quantity.addEventListener('keyup', (e) =>  {
    regulateQuantity() // Regulala en funcion del stock
})

// Cada vez que cambia la cantidad por medio de los botones del campo
quantity.addEventListener('change', (e) => {
    regulateQuantity()
})

// Click en el botón guardar
buttonSave.addEventListener('click', async () => {
    const saleDetail = JSON.parse(sessionStorage.getItem("addedSales"))

    if (saleDetail && fieldsCheck.employees && fieldsCheck.routes) {

        await swal({
            icon: "warning",
            title: "¿Seguro de guardar los cambios?",
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

                    const newShift = {
                        Ruta_FK__turno: routes.selectedIndex,
                        Distribuidor_FK__turno: employees.selectedIndex
                    }

                    const shiftInsertID = await window.electronAPI.insertNewShift(newShift)

                    if (typeof shiftInsertID == "number") {
                        const newSaleWithShift = {
                            Venta_PK: newSaleID,
                            Fecha__venta: dateField.value,
                            Hora_inicio__venta: timeField.value,
                            Turno_FK__venta: shiftInsertID
                        }

                        const saleWithShiftInsertID = await window.electronAPI.insertNewSaleWithShift(newSaleWithShift)
                        if (typeof saleWithShiftInsertID == "number") {
                            await window.electronAPI.insertSaleDetail(saleDetail)

                            await swal({
                                title: "Venta iniciada exitosamente",
                                button: {
                                    text: 'Aceptar'
                                }
                            })

                            sessionStorage.removeItem("index")
                            sessionStorage.removeItem("addedSales")
                            await window.electronAPI.navigateTo(links.home)
                        }
                    }

                    break;
             
                default:
                    buttonSave.classList.toggle('button_save_active')
                    buttonCancel.classList.toggle('button_cancel_active')
                    break;
              }
        })
    }else{
        const errorMessageForm = document.getElementById('errorMessageForm')
        errorMessageForm.classList.add('formulario__data-error')
        errorMessageForm.classList.remove('display-none')

        buttonSave.classList.toggle('button_save_active')
        buttonCancel.classList.toggle('button_cancel_active')

        setTimeout(() => {
            errorMessageForm.classList.remove('formulario__data-error')
            errorMessageForm.classList.add('display-none')
        }, 5000);
    }
    
})

buttonCancel.addEventListener('click', async() => {
    confirmToExit(goToHome, "error")
})

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