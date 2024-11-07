import pool from "../dbconfig.js";
 const ingresarImpuesto = async (req, res) => {
    try {
        const userId = req.id;
        const { nroImpuesto } = req.body;
        console.log("userId:", userId);
        console.log("nroImpuesto:", nroImpuesto);
        if (!userId || !nroImpuesto) {
            return res.status(400).json({ error: "Datos faltantes: userId o nroImpuesto no proporcionados" });
        }
        const query = 'INSERT INTO impuesto (id_usuario, nroImpuesto) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(query, [userId, nroImpuesto]);
        res.json({ success: true, message: "Número de Impuesto ingresado correctamente", data: result.rows });
    } catch (error) {
        console.error("Error al ingresar el impuesto", error);
        res.status(500).json({ error: "Error al ingresar el impuesto a pagar" });
    }
};

const traerImpuesto = async (req, res) => {
    try {
        const userId = req.id;  
        const query = "SELECT nroImpuesto FROM impuesto WHERE id = $1";
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener los datos del impuesto:", error);
        res.status(500).json({ error: "Error al obtener los datos del impuesto" });
    }
};

const pagarImpuesto = async (req, res) => {
    try {
        const { usuarioId, impuestoId } = req.body;

        // Verificar que el impuesto exista y pertenezca al usuario
        const queryVerificarImpuesto = `SELECT tipo, nroimpuesto FROM impuestos WHERE id = $1 AND id_usuario = $2`;
        const impuesto = await pool.query(queryVerificarImpuesto, [impuestoId, usuarioId]);

        if (impuesto.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Impuesto no encontrado o no pertenece al usuario" });
        }

        const { tipo, nroimpuesto } = impuesto.rows[0];

        // Registrar la actividad en la tabla actividades
        await pool.query("BEGIN"); // Iniciar transacción

        const descripcion = `Pago de impuesto ${tipo} con número ${nroimpuesto}`;
        const queryRegistrarActividad = `
            INSERT INTO actividades (descripcion, id_usuario, fecha) 
            VALUES ($1, $2, $3) RETURNING id
        `;
        const actividad = await pool.query(queryRegistrarActividad, [
            descripcion,
            usuarioId,
            new Date()
        ]);

        await pool.query("COMMIT"); // Confirmar transacción

        return res.status(200).json({ 
            success: true, 
            message: "Pago registrado exitosamente", 
            actividadId: actividad.rows[0].id 
        });

    } catch (error) {
        await pool.query("ROLLBACK"); // Revertir la transacción en caso de error
        console.error(error);
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};


const Impuesto = {
    ingresarImpuesto, 
    traerImpuesto,
    pagarImpuesto
}
export default Impuesto 