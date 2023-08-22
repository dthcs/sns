const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { renderProfile, renderJoin, renderMain, renderHashtag, renderGood, createGood, renderAuction, renderBid, bid } = require('../controllers/page');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user?.Followers?.length || 0;
    res.locals.followingCount = req.user?.Followings?.length || 0;
    res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || [];
    next();
});

router.get('/profile', isLoggedIn, renderProfile);
router.get('/join', isNotLoggedIn, renderJoin);
router.get('/good', isLoggedIn, renderGood);

// router.get('/profile', renderProfile);

// router.get('/join', renderJoin);
router.get('/', renderMain);
router.get('/hashtag', renderHashtag);

router.get('/home', (req, res) => {
    res.render('index');
});

router.get('/auction', renderAuction);

try{
    fs.readdirSync('uploads');
}catch(error){
    console.error('no uploads folder. Please create uploads folder');
    fs.mkdirSync('uploads');
}
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'uploads/');
        },
        filename(req, file, cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024},
});
router.post('/good', isLoggedIn, upload.single('img'), createGood);

router.get('/good/:id', isLoggedIn, renderBid);
router.post('/good/:id/bid', isLoggedIn, bid);
module.exports = router;