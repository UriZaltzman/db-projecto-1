import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader) {
        return res.status(401).json({ error: 'No hay token' });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token || authorizationHeader.split(' ')[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Token inválido1' });
    }

    try {
        const verifiedToken = jwt.verify(token, "tu_secreto");  // Cambia "tu_secreto" por la clave secreta real
        req.id = verifiedToken.id;  // Almacena el ID del usuario decodificado en req.id
        next();  // Pasa al siguiente middleware o ruta
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido2', error });
    }
};



const corsOptions = {
    origin: ['http://dominio-aceptado.com', 'http://otro-dominio.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    optionsSuccessStatus: 200
};  
const corsop = {corsOptions};
export default corsop;