async function getCompletedSales(){
   const completedSales = await window.electronAPI.selectCompletedSales()
   console.log(completedSales)
}

getCompletedSales()