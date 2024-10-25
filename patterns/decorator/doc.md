# Patrón Decorator en el Proyecto de Parqueadero

## Introducción

El patrón Decorator es un patrón de diseño estructural que permite añadir funcionalidades a un objeto de manera dinámica. Este patrón se utiliza para extender las capacidades de los objetos de manera flexible y reutilizable, sin modificar su estructura original.

## Estructura del Código

### Clase `VehiculoDecorator`

La clase `VehiculoDecorator` es la clase base para todos los decoradores. Esta clase contiene una referencia al objeto `Vehiculo` que está siendo decorado y delega la llamada al método `calcularPago` al objeto decorado.

```javascript
class VehiculoDecorator {
    constructor(vehiculo) {
        this.vehiculo = vehiculo;
    }

    calcularPago(horas) {
        return this.vehiculo.calcularPago(horas);
    }
}
```

### Subclase `GymDescuentoDecorator`

La subclase `GymDescuentoDecorator` extiende `VehiculoDecorator` y añade un descuento del 20% al cálculo del pago.

```javascript
class GymDescuentoDecorator extends VehiculoDecorator {
    calcularPago(horas) {
        const pagoOriginal = super.calcularPago(horas);
        return pagoOriginal * 0.8; // Aplicar 20% de descuento
    }
}
```

### Subclase `HospitalDescuentoDecorator`

La subclase `HospitalDescuentoDecorator` extiende `VehiculoDecorator` y añade un descuento del 35% al cálculo del pago.

```javascript
class HospitalDescuentoDecorator extends VehiculoDecorator {
    calcularPago(horas) {
        const pagoOriginal = super.calcularPago(horas);
        return pagoOriginal * 0.65; // Aplicar 35% de descuento
    }
}
```

## Diagrama de Clases

![Diagrama de Clases](diagrama_decorator.png)

## Explicación del Código

### Clase `VehiculoDecorator`

La clase `VehiculoDecorator` es la clase base para todos los decoradores. Contiene una referencia al objeto `Vehiculo` que está siendo decorado y delega la llamada al método `calcularPago` al objeto decorado.

### Subclase `GymDescuentoDecorator`

La subclase `GymDescuentoDecorator` extiende `VehiculoDecorator` y añade un descuento del 20% al cálculo del pago. Sobrescribe el método `calcularPago` para aplicar el descuento al pago original calculado por el objeto decorado.

### Subclase `HospitalDescuentoDecorator`

La subclase `HospitalDescuentoDecorator` extiende `VehiculoDecorator` y añade un descuento del 35% al cálculo del pago. Sobrescribe el método `calcularPago` para aplicar el descuento al pago original calculado por el objeto decorado.

## Uso del Patrón Decorator en el Proyecto

En el proyecto de parqueadero, el patrón Decorator se utiliza para añadir descuentos a los vehículos de manera flexible y reutilizable. Esto permite aplicar diferentes tipos de descuentos a los vehículos sin modificar su estructura original.

## Ejemplo de Uso

```javascript
const vehiculo = new Vehiculo();
const vehiculoConDescuentoGym = new GymDescuentoDecorator(vehiculo);
const vehiculoConDescuentoHospital = new HospitalDescuentoDecorator(vehiculo);

console.log(vehiculoConDescuentoGym.calcularPago(5)); // Pago con descuento del 20%
console.log(vehiculoConDescuentoHospital.calcularPago(5)); // Pago con descuento del 35%
```

## Conclusión

El patrón Decorator es una solución efectiva para añadir funcionalidades a los objetos de manera dinámica en el proyecto de parqueadero. Proporciona una forma flexible y reutilizable de aplicar descuentos a los vehículos sin modificar su estructura original.