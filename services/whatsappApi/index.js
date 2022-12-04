const axios = require("axios");
require("dotenv").config();

const whatsappApiService = {};

whatsappApiService.sendMessage = async (phone_number_id, data) => {
    try {
        const url = process.env.WHATSAPP_HOST + phone_number_id + "/messages?access_token=" + process.env.WHATSAPP_TOKEN;
        const headers = { "Content-Type": "application/json" };
        console.log(url);
        console.log(data);
        var data1 = await axios.post(url, data, { headers });
        console.log(data1);
        return 200;
    } catch (error) {
        console.log(error);
        return 400;
    }
}

module.exports = whatsappApiService;