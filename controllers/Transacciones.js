import pool from "../dbconfig.js";

/* const filtro = async (req, res) => {
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
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
} */

const filtro = async (req, res) => {
    try {
            
        const Check = req.query.Check || ''; 
        const userId = req.id
    
        let filtrar;
        let params;
    
        if (Check) {
            filtrar = "SELECT id, nombre, apellido, mail FROM perfil WHERE id = $1 AND (mail ILIKE '%' || $2 || '%' OR dni ILIKE '%' || $2 || '%' OR nombre ILIKE '%' || $2 || '%' OR apellido ILIKE '%' || $2 || '%')";
            params = [userId ,Check];
        } else {
            filtrar = "SELECT id, nombre, apellido, mail FROM perfil";
            params = [];
        }
    
        const resultadoFiltro = await pool.query(filtrar, params);
    
        return res.status(200).json({ success: true, results: resultadoFiltro.rows });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};
    
    

const transferirDinero = async (req, res) => {
    try {
        const { saldo, destinatarioId } = req.body;
        const remitenteId = req.id;

        console.log("saldo: " + saldo);
        console.log("destinatarioId: " + destinatarioId);
        console.log("remitenteId: " + remitenteId);

        // Verificar que el remitente tenga saldo suficiente
        const querySaldoRemitente = "SELECT saldo FROM perfil WHERE id = $1";
        const remitente = await pool.query(querySaldoRemitente, [remitenteId]);

        if (remitente.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Usuario no encontrado" });
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
            INSERT INTO transacciones (id_user, destino, fecha, monto)
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const registroTransferencia = await pool.query(queryInsertarTransferencia, [
            remitenteId,
            destinatarioId,
            new Date(),
            saldo
        ]);

        await pool.query("COMMIT"); // Confirmar la transacción

        return res.status(200).json({ 
            success: true, 
            message: "Transferencia exitosa", 
            transferenciaId: registroTransferencia.rows[0].id 
        });

    } catch (error) {
        await pool.query("ROLLBACK"); // Revertir la transacción en caso de error
        console.log(error);
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

const transferirDineroSimulacion = async (req, res) => {
    try {
        const { remitenteId, saldo, destinatarioId } = req.body;

        // Verificar que el remitente tenga saldo suficiente
        const querySaldoRemitente = "SELECT saldo FROM perfil WHERE id = $1";
        const remitente = await pool.query(querySaldoRemitente, [remitenteId]);

        if (remitente.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Usuario no encontrado" });
        }

        const saldoRemitente = remitente.rows[0].saldo;

        if (saldoRemitente < saldo) {
            return res.status(400).json({ success: false, message: "Saldo insuficiente" });
        }

        const queryDestinatario = "SELECT id, nombre, apellido FROM perfil WHERE id = $1";
        const destinatario = await pool.query(queryDestinatario, [destinatarioId]);

        if (destinatario.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Persona no encontrado" });
        }

        const destinatarioNombre = `${destinatario.rows[0].nombre} ${destinatario.rows[0].apellido}`;
        
        const queryRestarSaldoRemitente = "Select *, saldo - $1  as nuevo_saldo from perfil WHERE id = $2";
        const datamensaje = await pool.query(queryRestarSaldoRemitente, [saldo, remitenteId]);
        const mensajeAVISO = `vas a transferir ${saldo} a ${destinatarioNombre}. Después de la operación te va a quedar ${datamensaje.rows[0].nuevo_saldo}. ¿Estas de acuerdo?`;

        return res.status(200).json({ 
            success: true, 
            message: mensajeAVISO, 
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

/*const crearsube = async (req,res) => {
try {
    const {sube} = req.body;

    const querySaldoRemitente = "INSERT INTO transacciones (id_user, destino, fecha, monto)
                                VALUES ($1, $2, $3, $4) RETURNING id";
    const remitente = await pool.query(querySaldoRemitente, [remitenteId]);
    if (sube.rows.length <= 15) {
        return res.status(400).json({ success: false, message: "Error al cargar sube" });
    }

}
catch (error) {
    console.log (error)
}
}
*/

const Transferencias = { filtro, transferirDinero, transferirDineroSimulacion};
export default Transferencias;