

const axios = require("axios");
require("dotenv").config();

const sendResponse = async (phone_number_id, data) => {
    try {
        
        const url = "https://graph.facebook.com/v14.0/" + phone_number_id + "/messages?access_token=" + process.env.WHATSAPP_TOKEN;
        const headers = { "Content-Type": "application/json" };
        await axios.post(url, data, { headers });
        return 200;
    } catch (error) {
        console.log(error.response);
        return 400;
    }
}

const getAllCategories = async (page) => {
    try {
        const { data } = await axios.get(
            process.env.BACKEND_URL+"category/getActiveCategories?page="+page+"&limit=9",
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
}

const getProductsByCategory = async (id, page) => {
    try {
        const { data } = await axios.get(
            process.env.BACKEND_URL+"product/getActiveProductsIncategory?category_id="+id+"&page="+page+"&limit=9",
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
}

const getProductByProductId = async (id) => {
    try {
        const { data } = await axios.get(
            process.env.BACKEND_URL+"product/"+id,
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
}

const sendMoreCategoriesMenu = async (page, req) => {
    try {
        page = Number(page);
        const nextPage = page + 1;
        const phone_number_id = req.metadata.phone_number_id;
        const from_phone_number = req.messages[0].from;
        const from_name = req.contacts[0].profile.name;
        const categoriesData = await getAllCategories(page);
        const categories = categoriesData.rows;

        const rows = categories.map(product => {
            return {
                "id": "categoryMenu-" + product.id,
                "title": product.category_name,
                "description": product.category_name + " description"
            }
        })
        if(categoriesData.isMoreRequired){
            rows.push(
                {
                    "id": "categoryMenu-More-" + nextPage,
                    "title": "More Categories",
                }
            )
        }
        let data = {
            messaging_product: "whatsapp",
            to: from_phone_number,
            type: "interactive",
            interactive: {
                "type": "list",
                "header": {
                    "type": "text",
                    "text": "More Categories"
                },
                "body": {
                    "text": "We have list of categories, select a category"
                },
                "footer": {
                    "text": "categories list"
                },
                "action": {
                    "button": "Categories Menu",
                    "sections": [
                        {
                            "title": "categories list",
                            "rows": rows
                        }
                    ]
                }
            }
        }
        return await sendResponse(phone_number_id, data);
    } catch (error) {
        return 400;
    }
}

const initialMessage = async (req) => {
    try {
        const phone_number_id = req.metadata.phone_number_id;
        const from_phone_number = req.messages[0].from;
        const from_name = req.contacts[0].profile.name;
        const categoriesData = await getAllCategories(0);
        const categories = categoriesData.rows;

        const rows = categories.map(product => {
            return {
                "id": "categoryMenu-" + product.id,
                "title": product.category_name,
                "description": product.category_name + " description"
            }
        })
        if(categoriesData.isMoreRequired){
            rows.push(
                {
                    "id": "categoryMenu-More-" + 1,
                    "title": "More Categories",
                }
            )
        }
        let data = {
            messaging_product: "whatsapp",
            to: from_phone_number,
            type: "interactive",
            interactive: {
                "type": "list",
                "header": {
                    "type": "text",
                    "text": "Hi " + from_name
                },
                "body": {
                    "text": "We have list of categories, select a category"
                },
                "footer": {
                    "text": "categories list"
                },
                "action": {
                    "button": "Categories Menu",
                    "sections": [
                        {
                            "title": "categories list",
                            "rows": rows
                        }
                    ]
                }
            }
        }
        return await sendResponse(phone_number_id, data);
    } catch (error) {
        return 400;
    }

}

const productMenuResponse = async (req, page) => {
    try {
        page = Number(page);
        const nextPage = page + 1;
        const phone_number_id = req.metadata.phone_number_id;
        const from_phone_number = req.messages[0].from;
        const category_title = req.messages[0].interactive.list_reply.title;
        const category_id = req.messages[0].interactive.list_reply.id.split("-")[1];
        const productsData = await getProductsByCategory(category_id, page);
        const products = productsData.rows;
        console.log(products);
        const rows = products.map(product => {
            return {
                "id": "productMenu-" + product.id,
                "title": product.product_name,
                "description": product.id + " " + product.product_name + " description"
            }
        })

        if(categoriesData.isMoreRequired){
            rows.push(
                {
                    "id": "productMenu-More-" + nextPage,
                    "title": "More Categories",
                }
            )
        }

        let data = {
            messaging_product: "whatsapp",
            to: from_phone_number,
            type: "interactive",
            interactive: {
                "type": "list",
                "header": {
                    "type": "text",
                    "text": category_title
                },
                "body": {
                    "text": "We have list of products, select a product"
                },
                "footer": {
                    "text": "products list"
                },
                "action": {
                    "button": "Product Menu",
                    "sections": [
                        {
                            "title": "product list",
                            "rows": rows
                        }
                    ]
                }
            }
        }
        return await sendResponse(phone_number_id, data);
    } catch (error) {
        return 400;
    }
}

const productDetailsResponse = async (req) => {
    const phone_number_id = req.metadata.phone_number_id;
    const from_phone_number = req.messages[0].from;
    const productId = req.messages[0].interactive.list_reply.id.split("-")[1];
    const productDetailsDTO = await getProductByProductId(productId);
    let ImageData = {
        messaging_product: "whatsapp",
        to: from_phone_number,
        type: "image",
        image: {
            "link": "https://demo-gupshup-flow.herokuapp.com/images/" + productId + ".jpg"
        }
    }
    await sendResponse(phone_number_id, ImageData);
    let data = {
        messaging_product: "whatsapp",
        to: from_phone_number,
        type: "interactive",
        interactive: {
            "type": "button",
            "body": {
                "text": `1. Product Name :  ${productDetailsDTO.name}\n2. Product Category : ${productDetailsDTO.category}\n3. Available Quantity : ${productDetailsDTO.quantity}\n4. Available Price : ${productDetailsDTO.price}`
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": "productDetails-" + productId,
                            "title": "Buy"
                        }
                    }
                ]
            }
        }
    }
    return await sendResponse(phone_number_id, data);
}

const productDetailsTemplateResponse = async (req) => {
    const phone_number_id = req.metadata.phone_number_id;
    const from_phone_number = req.messages[0].from;
    const productId = req.messages[0].interactive.list_reply.id.split("-")[1];
    const productDetailsDTO = await getProductByProductId(productId);

    let data = {
        messaging_product: "whatsapp",
        to: from_phone_number,
        type: "template",
        "template": {
            "name": "product_details",
            "language": {
                "code": "en"
            },
            "components": [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "image",
                            "image": {
                                "link": "https://demo-gupshup-flow.herokuapp.com/images/"+productId+".jpg"
                            }
                        }
                    ]
                },
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": productDetailsDTO.product_name
                        },
                        {
                            "type": "text",
                            "text": productDetailsDTO.category_id
                        },
                        {
                            "type": "text",
                            "text": productDetailsDTO.price
                        }
                    ]
                }
            ]
        }
    }
    return await sendResponse(phone_number_id, data);
}


const botMenu = async (req) => {
    try {
        const listType = req.messages[0].interactive.list_reply.id.split("-")[0];
        switch (listType) {
            case "categoryMenu":
                if(req.messages[0].interactive.list_reply.id.split("-")[1] == "More"){
                    const page = req.messages[0].interactive.list_reply.id.split("-")[2]
                    return await sendMoreCategoriesMenu(page, req);
                }
                console.log("-------------------check-----------------")
                return await productMenuResponse(req, 0);
            case "productMenu":
                if(req.messages[0].interactive.list_reply.id.split("-")[1] == "More"){
                    const page = req.messages[0].interactive.list_reply.id.split("-")[2]
                    return await productMenuResponse(req, page);
                }
                return await productDetailsTemplateResponse(req);
            default:
                break;
        }
    } catch (error) {
        console.log(error);
        return 400;
    }
}

const productDetailResponse = async (req) => {
    try {
        const btnResponse = req.messages[0].button.payload;
        const phone_number_id = req.metadata.phone_number_id;
        const from_phone_number = req.messages[0].from;
        if (btnResponse == "Buy Now") {
            //const response = await addNewOrder({productId:productId,phone: req.body.payload.sender.phone, name: req.body.payload.sender.name });
            let data = {
                messaging_product: "whatsapp",
                to: from_phone_number,
                type: "text",
                text: {
                    "body": "Thank you your order is placed"
                }
            }
            return await sendResponse(phone_number_id, data);
        }
        else {
            let data = {
                messaging_product: "whatsapp",
                to: from_phone_number,
                type: "text",
                text: {
                    "body": "Thank you "
                }
            }
            return await sendResponse(phone_number_id, data);
        }
    } catch (error) {
        return 400;
    }
}
const chatBotService = async (req) => {
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
                    const replyType = req.entry[0].changes[0].value.messages[0].interactive.type;
                    if (replyType == "list_reply") {
                        const response = await botMenu(req.entry[0].changes[0].value);
                        return response;
                    } else {
                        const response = await productDetailResponse(req.entry[0].changes[0].value);
                        return response;
                    }
                }
                case "button" : {
                    const response = await productDetailResponse(req.entry[0].changes[0].value);
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

module.exports = { chatBotService }