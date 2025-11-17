import { findByUsername } from "../../utils/helpers/findByUsername.js";

export const checkUsername = async (req, res) => {
    try {
        const user = await findByUsername(req.params.username);
        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ error: "Error verificando usuario" });
    }
};