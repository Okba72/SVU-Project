import { Router } from 'express';

const router = Router();


/* GET home page. */
router.get('/', (req, res, next) => {
    let staff = [
        {
            name: 'Anna'
        },
        {
            name: "Julia"
        },
        {
            name: "Erika"
        }
    ];
    res.json(staff);
});

router.get('/:userId', (req, res, next) => {
    let userId = req.params.userId;
    let staff =
    {
        name: userId
    };
    res.json(staff);
});

export default router;
