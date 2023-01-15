const Site = require('../models/sites');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.renderMap = async(req, res) => {
    const sites = await Site.find({});
    res.render('sites/world_map', { sites });
}

module.exports.showSite = async(req, res) => {
    const site = await Site.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!site) {
        req.flash('error', 'Cannot find that site!');
        return res.redirect('/');
    }
    const d = new Date();
    const currentTime = d.getTime();
    const daysDiffrence = Math.floor((currentTime - site.time) / (1000 * 60 * 60 * 24));
    res.render('sites/show', { site, daysDiffrence });
}

module.exports.renderNewSite = async(req, res) => {
    res.render('sites/newsite');
}

module.exports.newsite = async(req, res) => {
    const site = new Site(req.body.site);
    // forwardGeocode: translate from name of location to coordinates
    const geoData = await geocoder.forwardGeocode({
        query: req.body.site.location,
        limit: 1
    }).send()
    const d = new Date();
    const currentTime = d.getTime();
    site.time = currentTime;
    site.geometry = geoData.body.features[0].geometry;
    site.author = req.user._id;
    site.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await site.save();
    req.flash('success', 'Successfully made a new site!');
    res.redirect(`../sites/mysites`)
}

module.exports.renderEditSite = async(req, res) => {
    const { id } = req.params;
    const site = await Site.findById(id)
    res.render('sites/edit', { site });
}

module.exports.editSite = async(req, res) => {
    const { id } = req.params;
    const site = await Site.findByIdAndUpdate(id, {...req.body.site });
    if (req.files) {
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        site.images.push(...imgs);
    }
    await site.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await site.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campsite!');
    res.redirect(`/sites/${site._id}`)
}

module.exports.deleteSite = async(req, res) => {
    const { id } = req.params;
    await Site.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/sites/mysites');
}

module.exports.mySites = async(req, res) => {
    const id = req.user._id
    const sites = await Site.find({ author: id })
    if (!sites) {
        req.flash('error', 'Cannot find that site!');
        return res.redirect('/sites');
    }
    res.render('sites/mysites', { sites });
}