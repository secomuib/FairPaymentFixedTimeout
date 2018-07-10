pragma solidity ^0.4.18;

//variables del contrato
contract PayFairFixedTimeout {
    address comprador;//dirección del comprador
    address vendedor;//dirección del vendedor
    address a;//variable donde guardaremos la dirección que devuelve la función ecrecover
    uint timeout;//tiempo en el que el vendedor podrá finalizar
    bool finish;//booleano que nos permitirá saber si el intercambio ha finalizado
    uint precioComprador;//ethers que está dispuesto a pagar el comprador
    uint precioVendedor;//ethers que quiere cobrar el vendedor

//constructor
    function PayFairFixedTimeout(address _vendedor, uint duracion) public payable{//se debe de indicar por parámetros la dirección del vendedor y el timeout
        comprador = msg.sender;//se asignará a la variable comprador la dirección de quien ejecute esta transacción
        vendedor = _vendedor;//se asignará a la variable vendedor la dirección indicada por parámetros
        finish=false;//en la generación del contrato el intercambio no está finalizado
        timeout = now + duracion;//se actualiza el timeout
        precioComprador = msg.value;//a esta variable se le asigna el valor de ethers indicados en la transacción y que quedarán guardados en el contrato
    }

//función para la cancelación del comprador
    function Timeout() public {
        require(msg.sender == comprador && now >= timeout && finish==false);//para realizar esta función se requiere haber superado el timeout, el intercambio no haber finalizado y la ejecución la debe de realizar el comprador
        finish = true;//en este momento el intercambio finaliza
        selfdestruct(comprador);//el contrato se destruye y los ethers serán enviados a la dirección del comprador
    }

//función para la finalización del vendedor
     function finished(uint _precioVendedor, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public {//esta función requiere una serie de parámetros como los ethers que el vendedor quiere cobrar, el mensaje que envía el comprador al vendedor y una serie de bytes extraidos de la firma realizada por el vendedor
        precioVendedor=_precioVendedor;//esta variable se actualiza con el valor de  los ethers indicados al ejecutar la función
        a=ecrecover(hash, v, r, s);//a esta variable se le asigna una dirección proporcionada gracias a ecrecover
        require(msg.sender==vendedor && now < timeout && precioVendedor==precioComprador && a==vendedor && finish==false);//para poder ejecutar esta función se requiere que la ejecución la realice el vendedor, no haya expirado el timeout, coincidan los ethers del comprador y vendedor, la función ecrecover devuelva la dirección del comprador y el intercambio no esté finalizado
        finish=true;//en este momento el intercambio finaliza
        selfdestruct(vendedor);//el contrato se destruye y los ethers serán enviados a la dirección del vendedor
    }
}
