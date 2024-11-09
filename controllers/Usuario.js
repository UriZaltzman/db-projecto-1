import pool from "../dbconfig.js"
import bcrypt from "bcryptjs"
import e from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { verifyToken } from "../middlewares/Usuario.middleware.js";

/*const Logearse = async(req ,res)=> {
    try{ 
        const hashedPassword = await bcrypt.hash(req.body.contrasena, 10);
        const Usuario = await pool.query(
            'SELECT mail, contrasena FROM perfil WHERE mail  = $1',
            [req.body.mail]
        );
        if (Usuario.rows.length == 1) {
            if (await bcrypt.compare(req.body.contrasena, Usuario.rows[0].contrasena))
            {
                const token = jwt.sign({ id: Usuario.rows[0].id }, "tu_secreto"/*process.env.SECRET, {
                    expiresIn: "1d",
                    });
                return res.status(200).json({ message: 'Se logeo correctamente.', token });
            }
                
            else 
                return res.status(500).json({ success: false, message: 'La contraseña o el mail son incorrecto11'});
        } else  
            return res.status(500).json({ success: false, message: 'La contraseña o el mail son incorrecto2' });
    }   catch (e) {
        console.log(e);
        res.status(500).json('La contraseña o el usuario no son correctos');
    }
    if(!Usuario){
        return res.status(400).send({status:"Error", message: "Error durante el login"})
    }
};*/

const OlvidasteContra = async(req, res) => {
    const { mail } = req.body;
    try {
        // Verificar si el email existe
        const MailCheck = await pool.query('SELECT * FROM perfil WHERE mail = $1', [mail]);

        if (MailCheck.rows.length === 0) {
            return res.status(404).json({ message: 'El correo electrónico no está registrado.' });
        }
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al enviar el correo de restablecimiento de contraseña.' });
    }
};

const Profile = async(req, res) => {
    try {
        // Consulta para obtener los datos del usuario por ID
        const query = 'SELECT id, nombre, apellido, mail, direccion, dni FROM perfil WHERE id = $1';
        const result = await pool.query(query, [req.params.id]);
        if (result.rows.length > 0) {
            return res.status(200).json({ data: result.rows[0]});
        }
        else {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
    } catch (error){
        console.error(error);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener el perfil del usuario'
        });
    }
};

const Logearse = async(req, res) => {
    try {
        if (!req.body.mail || !req.body.contrasena) {
            return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos.' });
        }

        const Usuario = await pool.query(
            'SELECT id, mail, contrasena FROM perfil WHERE mail = $1',
            [req.body.mail]
        );

        if (Usuario.rows.length == 1) {
            const passwordMatch = await bcrypt.compare(req.body.contrasena, Usuario.rows[0].contrasena);

            if (passwordMatch) {
                const token = jwt.sign({ id: Usuario.rows[0].id }, "tu_secreto", { expiresIn: "1H" });
                return res.status(200).json({ message: 'Se logeó correctamente.', token });
            } else {
                return res.status(401).json({ success: false, message: 'La contraseña o el correo electrónico son incorrectos.' });
            }
        } else {
            return res.status(404).json({ success: false, message: 'El correo electrónico no está registrado.' });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Error durante el inicio de sesión.' });
    }
};
const infoPersona = async (req, res) => {
    try {
        const userId = req.id;  // Utiliza el ID de usuario decodificado del token
        const query = "SELECT nombre, apellido FROM perfil WHERE id = $1";
        const result = await pool.query(query, [userId]);

        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener los datos del perfil:", error);
        res.status(500).json({ error: "Error al obtener los datos del perfil" });
    }
};

const usuarioInfo = async (req, res) => {
    try {
        const userId = req.id;  
        const query = "SELECT * FROM perfil WHERE id = $1";
        const result = await pool.query(query, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        res.status(500).json({ error: "Error al obtener los datos del usuario" });
    }
};

const compartir = async (req, res) => {
    try {
        const userId = req.id;  
        const query = "SELECT nombre, apellido, mail FROM perfil WHERE id = $1";
        const result = await pool.query(query, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        res.status(500).json({ error: "Error al obtener los datos del usuario" });
    }
};

const verSaldo = async (req, res) => {
    try{
        const userId = req.id
        console.log("Saldo: " + userId);
        const queryVerSaldo = "SELECT saldo FROM perfil WHERE id = $1"
        const result = await pool.query(queryVerSaldo, [userId]);

        res.json(result.rows);

    } catch (error){
        console.error("Error al obtener los datos del usuario:", error);
        res.status(500).json({ error: "Error al obtener los datos del usuario" });
    }
};
const enviarCodigo = async (req, res) => {
    const { mail } = req.body;

    try {
        // Verificar si el email existe en la base de datos
        const MailCheck = await pool.query('SELECT id FROM perfil WHERE mail = $1', [mail]);
        if (MailCheck.rows.length === 0) {
            return res.status(404).json({ message: 'El correo electrónico no está registrado.' });
        }

        // Generar un código de 5 dígitos
        const codigo = Math.floor(10000 + Math.random() * 90000);

        // Guardar el código en la base de datos con un tiempo de expiración
        const userId = MailCheck.rows[0].id;
        const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
        await pool.query(
            'INSERT INTO codigos_verificacion (id_usuario, codigo, expiracion) VALUES ($1, $2, $3) ON CONFLICT (id_usuario) DO UPDATE SET codigo = $2, expiracion = $3',
            [userId, codigo, expirationTime]
        );

        // Configurar transporte para nodemailer
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "tu_correo@gmail.com",
                pass: "tu_contraseña"
            }
        });

        // Enviar correo con el código
        const mailOptions = {
            from: "tu_correo@gmail.com",
            to: mail,
            subject: "Código de Verificación",
            text: `Tu código de verificación es: ${codigo}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Código enviado al correo." });
    } catch (error) {
        console.error("Error al enviar el código de verificación:", error);
        res.status(500).json({ error: "Error al enviar el código de verificación." });
    }
};


const forgotPassword = async (res, req) => {
    try{
        const { nuevaContrasena, confirmarContrasena} = req.body
        const userId = req.id

        // Validar que ambas contraseñas esten puestas correctamente
        if (!nuevaContrasena || !confirmarContrasena) {
            return res.status(400).json({ error: "Ambas contraseñas son requeridas." });
        }

        // Validar que ambas contraseñas coincidan
        if (nuevaContrasena !== confirmarContrasena) {
            return res.status(400).json({ error: "Las contraseñas no coinciden." });
        }

         // Encriptar la nueva contraseña
         const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

         // Actualizar la contraseña en la base de datos
         const queryUpdatePassword = "UPDATE perfil SET contrasena = $1 WHERE id = $2";
         await pool.query(queryUpdatePassword, [hashedPassword, userId]);
 
         res.status(200).json({ message: "Contraseña actualizada exitosamente." });

    }catch (error){
        console.error("Error al restablecer la contraseña", error);
        res.status(500).json({ error: "Error"})
    }
};

const Usuario = {
    Logearse,    
    Profile,
    infoPersona,
    usuarioInfo,
    compartir,
    verSaldo,
    forgotPassword
}

export default Usuario; 