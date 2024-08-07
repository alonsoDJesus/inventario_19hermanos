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
const establecerIncorrecto = (nameField, field, errorMessage = '') => {
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
    errorMessage != '' ? warningMessage.innerText = errorMessage : ''  // En su texto interior se le da un mensaje de error
}

const mostrarMensajeCaution= (nameField, field, errorMessage = "") => {
    document.querySelector(`#${nameField}__caution p`).innerText = errorMessage

    document.getElementById(`${nameField}__caution`).classList.remove('display-none');
    document.getElementById(`${nameField}__caution`).classList.add('formulario__data-error');
}

const ocultarMensajeCaution= (nameField, field) => {
    document.getElementById(`${nameField}__caution`).classList.add('display-none');
    document.getElementById(`${nameField}__caution`).classList.remove('formulario__data-error');
}

function clearValidations(nameField, field){
    // Se ocultan los íconos
    document.getElementById(`${nameField}__val`).classList.remove('opacity-1');
    document.getElementById(`${nameField}__val`).classList.add('opacity-0');

    // Se eliminan los íconos de correcto o incorrecto
    document.getElementById(`${nameField}__val`).classList.remove('icon-wrong');
    document.getElementById(`${nameField}__val`).classList.remove('icon-check');

    // Se eliminan mensajes de error
    field.parentNode.children[`${nameField}__warning`].classList.remove('formulario__input-error-activo')

    fieldsCheck[nameField] = false; // En el objeto de los campos se señala una entrada incorrecta
}

async function showSwalToFillemptyFields(){
    await swal({
        icon: 'warning',
        title: '¡Te hacen falta datos!',
        text: 'Corrije o llena los campos que están señalados en rojo.',
        padding: '1.4rem',
        buttons: {    
            confirm: {
                text: "Aceptar",
                value: true,
                visible: true,
                closeModal: true
            }
        }
    })
}