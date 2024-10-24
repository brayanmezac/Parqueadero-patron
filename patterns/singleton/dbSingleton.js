const sqlite3 = require('sqlite3').verbose();

class DbSingleton {
    constructor() {
        if (!DbSingleton.instance) {
            this.connection = new sqlite3.Database('parqueadero.db', (err) => {
                if (err) {
                    console.error('Error al conectar a la base de datos:', err.message);
                } else {
                    console.log('Conectado a la base de datos SQLite.');
                }
            });
            DbSingleton.instance = this;
        }
        return DbSingleton.instance;
    }

    getInstance() {
        return this.connection;
    }

    disconnect() {
        if (this.connection) {
            this.connection.close((err) => {
                if (err) {
                    console.error('Error al desconectar la base de datos:', err.message);
                } else {
                    console.log('Desconectado de la base de datos SQLite.');
                }
            });
            this.connection = null;
        }
    }
}

const instance = new DbSingleton();
Object.freeze(instance);

module.exports = instance;