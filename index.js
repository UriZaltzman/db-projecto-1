import express from 'express';
import cors from 'cors';
import Registro from './controllers/Registro.js';
import Usuario from './controllers/Usuario.js';
import Transferencias from './controllers/Transacciones.js'
import Sube from './controllers/Sube.js'
import Impuesto from './controllers/Impuesto.js'
import corsop, { verifyToken } from './middlewares/Usuario.middleware.js';
import Celular from './controllers/Celular.js';
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
app.post("/forgotPassword", Usuario.forgotPassword);

//Transacciones
app.get("/filtro", Transferencias.filtro);
app.post("/transferir", verifyToken, Transferencias.transferirDinero);
app.post("/simtransferencia", verifyToken, Transferencias.transferirDineroSimulacion);
app.put("/recargarSaldo", verifyToken, Usuario.recargarSaldo);
app.get("/verTransacciones", verifyToken, Transferencias.verTransacciones)

// Funciones de menor importancia
app.get("/usuarioInfo", verifyToken, Usuario.usuarioInfo);   
app.get('/infoPersona', verifyToken, Usuario.infoPersona);
app.get("/compartir", verifyToken, Usuario.compartir);
app.get("/verSaldo", verifyToken, Usuario.verSaldo);

// Funcion Recargar Celular
app.post("/ingresarCelular", verifyToken, Celular.ingresarCelular)
app.get("/traerCelulars", verifyToken, Celular.traerCelulares)
app.post("/verCelulares", verifyToken, Celular.VerCelulares);
app.post("/pagarCelular", verifyToken, Celular.Pagarcelular);

// Funcion Recargar Sube
app.post("/ingresarSube", verifyToken, Sube.ingresarSube);
app.get("/traerSube", verifyToken, Sube.traersube);

// Funcion Pagar Impuestos
app.post("/ingresarImpuesto", verifyToken, Impuesto.ingresarImpuesto)
app.get("/traerImpuesto", verifyToken, Impuesto.traerImpuestos)
app.post("/verimpuestos", verifyToken, Impuesto.VerImpuestos);
app.post("/pagarImpuesto", verifyToken, Impuesto.PagarImpuesto);


//Sube
//app.post("/crearsube", sube.nroSube)

// Uncomment these if needed
// app.use("/saldo", getSaldo);
// app.use("/transferir", transferirDinero);
// app.use("/transacciones", getTransacciones);

/* app.listen(port, () => {
    console.log(`Proyecto API listening at http://localhost:${port}`);
}); */
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
