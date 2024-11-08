import express from 'express';
import cors from 'cors';
import Registro from './controllers/Registro.js';
import Usuario from './controllers/Usuario.js';
import Transferencias from './controllers/Transacciones.js'
import Sube from './controllers/Sube.js'
import corsop, { verifyToken } from './middlewares/Usuario.middleware.js';
import Impuestos from './controllers/Impuestos.js';
// import { getSaldo, transferirDinero, getTransacciones } from './controllers/wallet.js';

const app = express();
/* const port = 3000;*/
const PORT = process.env.PORT || 3000;

// Middleware

//app.use(cors(corsop.corsOptions));
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
    res.send("Wallet TIC server is working");
});

// Registro
app.post("/nuevo", Registro.AddUser);
// Logearse
app.post("/login", Usuario.Logearse);
app.get("/profile/:id", verifyToken, Usuario.Profile);

//Transacciones
app.get("/filtro", Transferencias.filtro);
app.post("/transferir", Transferencias.transferirDinero);
app.post("/simtransferencia", Transferencias.transferirDineroSimulacion);

// Funciones de menor importancia
app.get("/usuarioInfo", verifyToken, Usuario.usuarioInfo);   
app.get('/infoPersona', verifyToken, Usuario.infoPersona);
app.get("/compartir", verifyToken, Usuario.compartir);

// Funcion Recargar Celular


// Funcion Recargar Sube
app.post("/ingresarSube", verifyToken, Sube.ingresarSube);
app.get ("/traerSube", verifyToken, Sube.traersube)


// Funcion Pagar Impuestos
app.post ("/ingresarImpuesto", verifyToken, Impuestos.ingresarImpuesto)
app.get ("/traerImpuesto", verifyToken, Impuestos.traerImpuesto)


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
