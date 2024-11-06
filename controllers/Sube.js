import pool from "../dbconfig.js";

const ingresarSube = async (req, res) => {
    try {
        const userId = req.id;
        const { nroSube } = req.body;

        console.log("userId:", userId);
        console.log("nroSube:", nroSube);

        if (!userId || !nroSube) {
            return res.status(400).json({ error: "Datos faltantes: userId o nroSube no proporcionados" });
        }

        const query = 'INSERT INTO sube (id_usuario, nroSube) VALUES ($1) RETURNING *';
        const result = await pool.query(query, [nroSube]);

        res.json({ success: true, message: "Número de Sube ingresado correctamente", data: result.rows });
    } catch (error) {
        console.error("Error al ingresar la sube", error);
        res.status(500).json({ error: "Error al ingresar el número de Sube" });
    }
};

const traersube = async (req, res) => {
    try {
        const userId = req.id;  
        const query = "SELECT nroSube FROM sube WHERE id = $1";
        const result = await pool.query(query, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener los datos de la sube:", error);
        res.status(500).json({ error: "Error al obtener los datos de la sube" });
    }
};

export default {
    ingresarSube,
    traersube
};
