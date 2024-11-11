import pool from "../dbconfig.js";

const ingresarImpuesto = async (req, res) => {
 try {
        const userId = req.id;
	const { tipo } = req.body;

        if (!userId || !tipo) {
            return res.status(400).json({ error: "Datos faltantes: userId, nroImpuesto o tipo no proporcionados" });
        }
	const query = 'INSERT INTO impuesto (id_usuario, nroimpuesto, tipo) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [userId, nroImpuesto, tipo]);

        res.status(201).json({ success: true, message: "Número de impuesto ingresado correctamente", data: result.rows });
    } catch (error) {
        console.error("Error al ingresar el impuesto", error);

	res.status(500).json({ error: "Error al ingresar el impuesto" });
    }
};


const traerImpuestos = async (req, res) => {
 try {
	const userId = req.id;

        if (!userId) {
            return res.status(400).json({ error: "ID de usuario no proporcionado" });
        }

        const query = "SELECT nroimpuesto, tipo, saldo FROM impuesto WHERE id_usuario = $1";
        const result = await pool.query(query, [userId]);

	res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al obtener los datos del impuesto:", error);
        res.status(500).json({ error: "Error al obtener los datos del impuesto" });
    }
};

const VerImpuestos = async (req, res) => {
    try{
        const userId = req.id;
        const { tipo } = req.body;
        console.log(tipo);
        console.log("Saldo: " + userId);
        const queryVerSaldo = "SELECT id, tipo, saldo FROM impuesto WHERE id_usuario = $1 AND tipo = $2 AND pagado = false"
        const result = await pool.query(queryVerSaldo, [userId, tipo]);

        return res.status(200).json({ success: true, results: result.rows });

    } catch (error){
        console.error("Error al obtener los impuestos pendiente de pagos", error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
};

const PagarImpuesto = async (req, res) => {
    const { id_impuesto, saldo } = req.body;
    try{
        const userId = req.id;
        console.log("id_impuesto: " + id_impuesto);
        console.log("userId: " + userId);

        const queryRestarSaldoRemitente = "UPDATE perfil SET saldo = saldo - $1 WHERE id = $2";
        await pool.query(queryRestarSaldoRemitente, [saldo, userId]);

       /* const queryInsertarTransferencia = `
            INSERT INTO transacciones (id_user, destino, fecha, monto)
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const registroTransferencia = await pool.query(queryInsertarTransferencia, [
            userId,
            "",
            new Date(),
            saldo
        ]);*/

        const queryVerSaldo = "update impuesto set pagado = true WHERE id = $1"
        const result = await pool.query(queryVerSaldo, [id_impuesto]);

        return res.status(200).json({ success: true, /*transferenciaID: registroTransferencia.rows[0].id */});

    } catch (error){
        console.error("Error al pagar el impuesto" + id_impuesto, error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
};

const Impuesto = {
    ingresarImpuesto, 
    traerImpuestos,
    PagarImpuesto,
    VerImpuestos
}
export default Impuesto;