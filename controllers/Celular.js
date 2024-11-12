import pool from "../dbconfig.js";

const ingresarCelular = async (req, res) => {
 try {
        const userId = req.id;
	const { tipocompanias } = req.body;

        if (!userId || !tipocompanias) {
            return res.status(400).json({ error: "Datos faltantes: userId, nroCelular o tipocompanias no proporcionados" });
        }
	const query = 'INSERT INTO celular (id_usuario, nrocelular, tipocompanias) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [userId, nroImpuesto, tipocompanias]);

        res.status(201).json({ success: true, message: "Número de celular ingresado correctamente", data: result.rows });
    } catch (error) {
        console.error("Error al ingresar el celular", error);

	res.status(500).json({ error: "Error al ingresar el celular" });
    }
};


const traerCelulares = async (req, res) => {
 try {
	const userId = req.id;

        if (!userId) {
            return res.status(400).json({ error: "ID de usuario no proporcionado" });
        }

        const query = "SELECT nrocelular, tipocompanias, saldo FROM celular WHERE id_usuario = $1";
        const result = await pool.query(query, [userId]);

	res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al obtener los datos del celular:", error);
        res.status(500).json({ error: "Error al obtener los datos del celular" });
    }
};

const VerCelulares = async (req, res) => {
    try{
        const userId = req.id;
        const { tipocompanias } = req.body;
        console.log(tipocompanias);
        console.log("Saldo: " + userId);
        const queryVerSaldo = "SELECT id, tipocompanias, saldo FROM celular WHERE id_usuario = $1 AND tipocompanias = $2 AND pagado = false"
        const result = await pool.query(queryVerSaldo, [userId, tipocompanias]);

        return res.status(200).json({ success: true, results: result.rows });

    } catch (error){
        console.error("Error al obtener los celular pendiente de pagos", error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
};

const Pagarcelular = async (req, res) => {
    const { id_celular, saldo } = req.body;
    try{
        const userId = req.id;
        console.log("id_celular: " + id_celular);
        console.log("userId: " + userId);

        const queryRestarSaldoRemitente = "UPDATE perfil SET saldo = saldo - $1 WHERE id = $2";
        await pool.query(queryRestarSaldoRemitente, [saldo, userId]);

        const queryVerSaldo = "update celular set pagado = true WHERE id = $1"
        const result = await pool.query(queryVerSaldo, [id_celular]);

        return res.status(200).json({ success: true, /*transferenciaID: registroTransferencia.rows[0].id */});

    } catch (error){
        console.error("Error al pagar el celular" + id_celular, error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
};

const Celular = {
    ingresarCelular, 
    traerCelulares,
    Pagarcelular,
    VerCelulares
}
export default Celular;