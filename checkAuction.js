const { scheduleJob } = require('node-schedule');
const { Op } = require('sequelize');
const { Good, Auction, User, sequelize } = require('./models');

module.exports = async() => {
    console.log('checkAuction');
    try{
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        const tartgets = await Good.findAll({  // no bidder after 24 hours
            where: {
                SoldId : null,
                createdAt: { [Op.lte] : yesterday},
            },
        });
        tartgets.forEach(async(good) => {
            const success = await Auction.findOne({
                where: {GoodId: good.id},
                order: [['bid', 'DESC']],
            });
            await good.setSold(success.UserId);
            await User.update({
                money: sequelize.literal(`money - ${success.bid}`),
            }, {
                where: {id: success.UserId},
            });
        });
        const ongoing = await Good.findAll({ // no bidder before 24 hours
            where: {
                SoldId: null,
                createdAt: { [Op.gte] : yesterday},
            },
        });
        ongoing.forEach((good) => {
            const end = new Date(good.createdAt);
            end.setDate(end.getDate()+1);
            const job = scheduleJob(end, async() => {
                const success = await Auction.findOne({
                    where: {GoodId: good.id},
                    order: [['bid', 'DESC']],
                });
                await good.setSold(success.UserId);
                await User.update({
                    money: sequelize.literal(`money - ${success.bid}`),
                }, {
                    where: {id: success.UserId},
                });
            });
            job.on('error', (err) => {
                console.error('Schedule error', err);
            });
            job.on('success', () => {
                console.log('Scheduling success');
            });
        });
    }catch(error) {
        console.error(error);
    }
};