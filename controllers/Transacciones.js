import pool from "../dbconfig.js";

const filtro = async (req, res) => {
    try{
        const { Check } = req.body
        const filtrar = "SELECT nombre, apellido, mail FROM perfil WHERE mail ILIKE '%' || $1 || '%' or dni ILIKE '%' || $1 || '%' or nombre ILIKE '%' || $1 || '%' or apellido ILIKE '%' || $1 || '%'"
        const resultadoFiltro = await pool.query(filtrar, [Check]);
    
        if (resultadoFiltro.rows.length === 0){
            return res.status(400).json({succes: false, message:"No se encontro una cuenta"})
        }else
        {
            return res.status(200).json({ success: true, results: resultadoFiltro.rows });
        }
    } catch (error){
        return res.status(500).json({ success: false, message: "Error en el servidor123" });
    }
}

const Transferir = async (req, res) => {

}



const Transferencias = { filtro };
export default Transferencias;