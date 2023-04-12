const consumerloc = require("../../models/consumer_location");

exports.saveLocation = async (req, res) => {
  try {
    const user = req.user;
    const { address, lat, long, city } = req.body;
    const locationData = await consumerloc.findOne({ consumer_id: user._id });
    if (locationData) {
      await consumerloc.findByIdAndUpdate(
        user._id,
        {
          address: address,
          lat: lat,
          long: long,
          city: city,
        },
        { new: true }
      );
      return res.json({
        success: true,
        message: "location updated",
      });
    }

    if (!locationData) {
      const createLocation = await consumerloc.create({
        consumer_id: user._id,
        address: address,
        lat: lat,
        long: long,
        city: city,
      });
      if (!createLocation) {
        return res.status(400).json({
          success: false,
          message: "cannot create location",
        });
      }
      return res.status(200).json({
        success: true,
        message: "location saved successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong", err });
  }
};

exports.getLocation = async (req, res) => {
  try {
    const user = req.user;
    const locationData = await consumerloc.findOne({ consumer_id: user._id });
    if (locationData) {
      return res.status(200).json({
        success: true,
        message: "location",
        data: locationData,
      });
    }
    return res.status(200).json({
      success: false,
      message: "location",
      data: [],
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong", err });
  }
};
