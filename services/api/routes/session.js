import { Router } from 'express';
import { getConfig } from "../server/config";

const router = Router();

router.get('/', (req, res) => {
    return res.send(req.context.models.users[req.context.me.id]);
});


router.post('/login', (req, res) => {
    let user = new User(req.body.email, req.body.password);

    // TODO: 
    //  1- lookup user and hashed password from mongo db
    //  2- set session cookie if successful, and return success
    //  3- otherwise, return failure, with no cookie
    res.json({ status: "success" });
})

/**
 * 
 */
router.get('/logout', (req, res) => {
    let loginUrl = getConfig().get("login_url");

    // TODO:
    // 1- return an expired cookie
    // 2- redirect to login

    res.redirect(loginUrl);
})

export default router;