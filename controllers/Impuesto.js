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

export default Impuestos = {
    ingresarImpuesto, 
    traerImpuesto
}