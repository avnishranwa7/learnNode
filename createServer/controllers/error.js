exports.get404 = (req, res, next)=>{
    res.render('404', { pageTitle: 'Page Not Found' });
};

exports.get500 = (req, res, next)=>{
    res.render('500', { pageTitle: 'Error!' });
};