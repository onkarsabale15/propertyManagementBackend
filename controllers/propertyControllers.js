const { ObjectId } = require('mongodb');
const { preAddChecks, addNewProperty, processAndSaveImages, newProperty, getById, allProperties } = require("../services/propertyServices")
const addProperty = async (req, res) => {
    const user = req.user;
    const body = await JSON.parse(req.body.data[0]);
    const uploadedImages = req.files.images;
    const addChecks = await preAddChecks(body, uploadedImages);
    if (!addChecks.success) {
        res.status(409).json({ type: false, message: addChecks.message })
    } else {
        const user_id = new ObjectId(user._id).toString();
        const newProp = await newProperty(body);
        if (!newProp.success) {
            const propId = new ObjectId(newProp.data._id).toString();
            const images = await processAndSaveImages(uploadedImages, user_id, propId);
            if (!images.success) {
                res.status(400).json({ type: false, message: images.message })
            } else {
                const newAddedProperty = await addNewProperty(newProp.data, user_id, images);
                if (!newAddedProperty.success) {
                    res.status(newAddedProperty.status).json({ type: false, message: newAddedProperty.message })
                } else {
                    res.status(201).json({ type: true, message: newAddedProperty.message, data: newAddedProperty.data });
                };
            }
        } else {
            res.status(500).json({ type: false, message: newProp.message });
        };
    };
};

const getPropertyById = async (req, res) => {
    try {
        const property_id = req.params.property_id;
        const prop = await getById(property_id);
        if (prop.success) {
            res.status(200).json({ type: true, data: prop.data });
        } else {
            res.status(500).json({ type: false, message: "Property not found" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ type: false, message: "Internal Server Error" });
    }
}

const getAllProperties = async (req, res) => {
    const page = req.query.page || 0;
    const properties = await allProperties(page);
    if (properties.success) {
        res.status(200).json({ type: true, data: properties.data });
    } else {
        res.status(500).json({ type: false, message: properties.message });
    }
}



module.exports = {addProperty, getPropertyById, getAllProperties};