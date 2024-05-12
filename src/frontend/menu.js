const body = document.body

body.innerHTML = `
<nav>
<div class="nav__container">
    <ul class="nav__options">
        <li class="nav__item" id="navHome">
            <img src="${icons.house}" alt="" class="nav__icon" id="houseSolid">
            <p>Inicio</p>
        </li>
        <li class="nav__item">
            <img src="${icons.box}" alt="" class="nav__icon" id="boxSolid">
            <p>Inventario</p>
            <ul class="nav__subitems">
                <li>
                    <p>Ver todos los productos</p>
                </li>
                <li>
                    <p>Registrar nuevo producto</p>
                </li>
            </ul>
        </li>
        <li class="nav__item">
            <img src="${icons.truck}" alt="" class="nav__icon" id="truckSolid">
            <p>Ventas</p>
            <ul class="nav__subitems">
                <li id="navNewSale">
                    <p>Nueva venta</p>
                </li>
                <li>
                    <p>Ver ventas iniciadas</p>
                </li>
                <li id="navCompletedSales">
                    <p>Ver ventas finalizadas</p>
                </li>
            </ul>
        </li>
        <li class="nav__item">
            <img src="${icons.user}" alt="" class="nav__icon" id="userSolid">
            <p>Personal</p>
            <ul class="nav__subitems">
                <li>
                    <p>Registrar nuevo personal</p>
                </li>
            </ul>
        </li>
    </ul>

    <div onclick="" class="button__close">
        <img src="${icons.off}" alt="" id="powerOffSolid">
    </div>
</div>
</nav>
`;