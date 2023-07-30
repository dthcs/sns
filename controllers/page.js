exports.renderProfile = (req, res) => {
    res.render('profile', { title: "My Info - SNS" });
};

exports.renderJoin = (req, res) => {
    res.render('join', { title: 'Sign-up - SNS'});
};

exports.renderMain = (req, res, next) => {
    const twits = [];
    res.render('main', {
        title: 'SNS',
        twits,
    });
};