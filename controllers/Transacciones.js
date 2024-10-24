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

const transferirDinero = async (req, res) => {
    try {
        const { remitenteId, saldo, destinatarioId } = req.body;

        // Verificar que el remitente tenga saldo suficiente
        const querySaldoRemitente = "SELECT saldo FROM perfil WHERE id = $1";
        const remitente = await pool.query(querySaldoRemitente, [remitenteId]);

        if (remitente.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Usuario no no encontrado" });
        }

        const saldoRemitente = remitente.rows[0].saldo;

        if (saldoRemitente < saldo) {
            return res.status(400).json({ success: false, message: "Saldo insuficiente" });
        }

        // Verificar que el destinatario existe y obtener su nombre
        const queryDestinatario = "SELECT id, nombre, apellido FROM perfil WHERE id = $1";
        const destinatario = await pool.query(queryDestinatario, [destinatarioId]);

        if (destinatario.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Persona no encontrado" });
        }

        const destinatarioNombre = `${destinatario.rows[0].nombre} ${destinatario.rows[0].apellido}`;

        // Realizar la transferencia
        await pool.query("BEGIN"); // Iniciar transacción

        // Restar el saldo del remitente
        const queryRestarSaldoRemitente = "UPDATE perfil SET saldo = saldo - $1 WHERE id = $2";
        await pool.query(queryRestarSaldoRemitente, [saldo, remitenteId]);

        // Sumar el saldo al destinatario
        const querySumarSaldoDestinatario = "UPDATE perfil SET saldo = saldo + $1 WHERE id = $2";
        await pool.query(querySumarSaldoDestinatario, [saldo, destinatarioId]);

        // Registrar la transferencia en la tabla transferencia
        const queryInsertarTransferencia = `
            INSERT INTO transferencia (id_user, destino, fecha)
            VALUES ($1, $2, NOW()) RETURNING id
        `;
        const registroTransferencia = await pool.query(queryInsertarTransferencia, [
            remitenteId,
            destinatarioNombre
        ]);

        await pool.query("COMMIT"); // Confirmar la transacción

        return res.status(200).json({ 
            success: true, 
            message: "Transferencia exitosa", 
            transferenciaId: registroTransferencia.rows[0].id 
        });

    } catch (error) {
        await pool.query("ROLLBACK"); // Revertir la transacción en caso de error
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

const Transferencias = { filtro, transferirDinero };
export default Transferencias;