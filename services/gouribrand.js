
const axios = require("axios");
require("dotenv").config();

const sendResponse = async (phone_number_id, data) => {
    try {
        console.log('sending');
        const url = process.env.WHATSAPP_HOST + phone_number_id + "/messages?access_token=" + process.env.WHATSAPP_TOKEN;
        const headers = { "Content-Type": "application/json" };
        await axios.post(url, data, { headers });
        return 200;
    } catch (error) {
        console.log(error.response);
        return 400;
    }
}

const getAllProducts = async () => {
    try {
        const url = process.env.WHATSAPP_HOST + process.env.CATALOG_ID + '/products?fields=["category","name","retailer_id", "product_group"]&access_token=' + process.env.WHATSAPP_TOKEN;
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        throw error;
    }
}
const initialMessage = async (req) => {
    const phone_number_id = req.metadata.phone_number_id;
    const from_phone_number = req.messages[0].from;
    const from_name = req.contacts[0].profile.name;

    var products = await getAllProducts();

    var sections = {}
    for (var cat of products) {
        if (sections[cat.product_group.retailer_id] == null) {
            let req = { product_retailer_id: cat.retailer_id }
            sections[cat.product_group.retailer_id] = [req]
        }
        else {
            let req = { product_retailer_id: cat.retailer_id }
            sections[cat.product_group.retailer_id].push(req)
        }
    }

    var asections = []
    for (var sec in sections) {
        reqdata = {
            title: sec,
            product_items: sections[sec]
        }
        asections.push(reqdata)
    }

    let data = {
        messaging_product: "whatsapp",
        to: from_phone_number,
        type: "interactive",
        interactive: {
            "type": "product_list",
            "header": {
                "type": "text",
                "text": "Hi " + from_name
            },
            "body": {
                "text": "We have list of Products, Happy shopping !!"
            },
            "footer": {
                "text": "SkaleBot"
            },
            "action": {
                "catalog_id": process.env.CATALOG_ID,
                "sections": asections
            }
        }
    }
    return await sendResponse(phone_number_id, data);
}
const gouribrandChatbot = async (req) => {
    if (req.object) {
        if (
            req.entry &&
            req.entry[0].changes &&
            req.entry[0].changes[0] &&
            req.entry[0].changes[0].value.messages &&
            req.entry[0].changes[0].value.messages[0]
        ) {
            const msgType = req.entry[0].changes[0].value.messages[0].type;
            switch (msgType) {
                case "text": {
                    const response = await initialMessage(req.entry[0].changes[0].value)
                    return response;
                }
                case "interactive": {
                    return 200
                }
                default:
                    break;
            }
        }
        return 200;
    } else {
        return 404;
    }
}

module.exports = { gouribrandChatbot }