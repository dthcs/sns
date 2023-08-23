const { User, Post, Hashtag, Good, Auction, sequelize } = require('../models');
const schedule = require('node-schedule');
const { Op } = require('sequelize');

exports.renderProfile = (req, res) => {
    res.render('profile', { title: "My Info - SNS" });
};

exports.renderJoin = (req, res) => {
    res.render('join', { title: 'Sign-up - SNS'});
};

exports.renderMain = async(req, res, next) => {
    try{
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.render('main', {
            title: 'SNS',
            twits: posts,
        });
    }catch(err){
        console.error(err);
        next(err);
    }
};

exports.renderHashtag = async (req, res, next) => {
    const query = req.query.hashtag;
    if(!query){
        return res.redirect('/');
    }
    try{
        const hashtag = await Hashtag.findOne({ where: { title: query }});
        let posts = [];
        if(hashtag){
            posts = await hashtag.getPosts({include: [{model: User}]});
        }
        return res.render('main', {
            title: `${query} | SNS`,
            twits: posts,
        });
    }catch(error){
        console.error(error);
        return next(error);
    }
};

exports.renderAuction = async(req, res, next) => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        const goods = await Good.findAll({
            where: { SoldId: null, createdAt: { [Op.gte]: yesterday}},
        });
        res.render('auction', {
            title: 'NodeAution',
            goods,
        });
    }catch(error){
        console.error(error);
        next(error);
    }
};

exports.renderGood = (req, res) => {
    res.render('good', { title: 'Good Create - NodeAution'});
};

exports.createGood = async(req, res, next) => {
    try{
        const {name, price} = req.body;
        const good = await Good.create({
            OwnerId: req.user.id,
            name,
            img: req.file.filename,
            price,
        });
        const end = new Date();
        end.setDate(end.getDate()+1);
        const job = schedule.scheduleJob(end, async() => {
            const success = await Auction.findOne({
                where: { GoodId: good.id },
                order: [['bid', 'DESC']],
            });
            await good.setSold(success.UserId);
            await User.update({
                money: sequelize.literal(`money - ${success.bid}`),
            }, {
                where: { id: success.UserId },
            });
        });
        job.on('error', (err) => {
            console.error('Scheduling error', err);
        });
        job.on('success', () => {
            console.log('Scheduling success');
        });
        res.redirect('/auction');
    }catch (error){
        console.error(error);
        next(error);
    }
};

exports.renderBid = async(req, res, next) => {
    try{
        const [good, auction] = await Promise.all([
            Good.findOne({
                where: { id: req.params.id },
                include: {
                    model: User,
                    as: 'Owner',
                },
            }),
            Auction.findAll({
                where: { GoodId: req.params.id },
                include: { model: User },
                order: [['bid', 'ASC']],
            }),
        ]);
        res.render('bid', {
            // title: `${good.name} - NodeAuction`,
            good,
            auction,
        });
    }catch(error){
        console.error(error);
        next(error);
    }
};

exports.bid = async(req, res, next) => {
    try{
        const {bid, msg}  = req.body;
        const good = await Good.findOne({
            where: {id:req.params.id},
            include: {model: Auction},
            order: [[{model: Auction}, 'bid', 'DESC']],
        });
        if(!good){
            return res.status(404).send("Good not found");
        }
        if(good.price >= bid){
            return res.status(403).send('Bid price more than starting price plz');
        }
        if(new Date(good.createdAt).valueOf() + (24*60*60*1000) < new Date()) {
            return res.status(403).send("Bid closed already");
        }
        if(good.Auction?.bid >= bid){
            return res.status(403).send("Bid price more than previous one plz");
        }
        const result = await Auction.create({
            bid,
            msg,
            UserId: req.user.id,
            GoodId: req.params.id,
        });

        req.app.get('io').to(req.params.id).emit('bid', {
            bid: result.bid,
            msg: result.msg,
            nick: req.user.nick,
        });
        return res.send('ok');
    }catch(error){
        console.error(error);
        return next(error);
    }
};

exports.renderList = async(req, res, next) => {
    try{
        const goods = await Good.findAll({
            where: { SoldId: req.user.id },
            include: { model: Auction },
            order: [[{ model: Auction }, 'bid', 'DESC']],
        });
        res.render('list', {title: 'Bid List - NodeAuction', goods});
    } catch(error){
        console.error(error);
        next(error);
    }
};