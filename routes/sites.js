const sites = require('../controllers/sites');
const express = require('express');
const { isLoggedIn, validateCampsite } = require('../middleware');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const catchAsync = require('../utils/catchAsync');

router.get('/', async(req, res) => {
    res.render('sites/index');
});

router.get('/map', sites.renderMap) // middleware, when /map is requested the sites.renderMap middleware would be called

router.route('/newsite')
    .get(isLoggedIn, sites.renderNewSite)
    .post(upload.array('image'), validateCampsite, catchAsync(sites.newsite))

router.get('/mysites', isLoggedIn, sites.mySites);

router.route('/edit/:id')
    .get(isLoggedIn, sites.renderEditSite)
    .put(isLoggedIn, upload.array('image'), catchAsync(sites.editSite))

router.route('/:id')
    .get(sites.showSite)
    .delete(isLoggedIn, catchAsync(sites.deleteSite));

module.exports = router;