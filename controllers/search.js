const { response } = require("express");
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const Review = require("../models/review");

module.exports.search =  async(req,res) => {
    try{
        const query = req.query.query; //The first query refers to the query parameters object second one specific parameter named query inside that object
        const results = await Listing.find({
            $or: [                                                // Here $or is used to search from multiple fields
                { title: { $regex: query, $options: "i" } },      // Here $regex is used to match pattern which is extracted from Query
                { location: { $regex: query, $options: "i" } },   // Here $options is used to make search case-sensitive.
                { country: { $regex: query, $options: "i" } },
            ]
        });
        // console.log("Search result", results);
        res.render("./search/search.ejs", {results, query});
    }
    catch (err) {
        res.status(500).send("Error while retrieving search results");
    }
};