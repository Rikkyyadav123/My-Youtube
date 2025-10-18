import { asynchandler } from "../util/asynchandler.js"

const registeruser = asynchandler(async (req, res) => {
    res.status(200).json({
        message : "ok"
    })
    }) 

    export { registeruser }