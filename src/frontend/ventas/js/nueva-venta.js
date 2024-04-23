const employees = document.getElementById('employees')
const routes = document.getElementById('routes')

function addOptions(selectField, dataset, key, optionDefault){
    selectField.appendChild(optionDefault)
    dataset.forEach(data => {
        const option = document.createElement('option')
        option.text = data[key]
        selectField.appendChild(option)
    });
}

async function getEmployees(){
    const employeesData = await window.electronAPI.selectEmployees()
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione algún empleado"
    addOptions(employees, employeesData, "nombre", emptyOption)

    
}

async function getRoutes(){
    const routesData = await window.electronAPI.selectRoutes()
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione alguna ruta"
    addOptions(routes, routesData, "ruta", emptyOption)
}

getEmployees()
getRoutes()