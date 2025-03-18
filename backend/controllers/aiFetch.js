const { default: axios } = require("axios")

exports.getAPI = async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const response = await axios.post('http://127.0.0.1:8000/score_lead/', data);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
