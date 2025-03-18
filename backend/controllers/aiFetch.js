const { default: axios } = require("axios")

exports.getAPI = async (req, res) => {
    const { body } = req;
    
    try {
        const response = await axios.post('https://dummyapi.com/api', body);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
