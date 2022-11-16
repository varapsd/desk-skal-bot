

const axios = require("axios");
require("dotenv").config();

const sendResponse = async (phone_number_id, data) => {
    try {
        console.log('sending');
        const url = "https://graph.facebook.com/v14.0/" + phone_number_id + "/messages?access_token=" + process.env.WHATSAPP_TOKEN;
        const headers = { "Content-Type": "application/json" };
        await axios.post(url, data, { headers });
        return 200;
    } catch (error) {
        console.log(error.response);
        return 400;
    }
}

const addEnquiry = async (name, phone) => {
    try {
        const data = { name, phone }
        await axios.post(process.env.BACKEND_URL+"/enquiry",data );
    } catch (error) {
        console.log(error);
    }
}

const addNewOrder = async (productId, from_name, from_phone ) => {
    try {
        const data = { product_id : Number(productId), name : from_name, phone : from_phone, status : "pending"};
        await axios.post(process.env.BACKEND_URL+"/order",data);
    } catch (error) {
        console.log(error);
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
        addEnquiry(from_name, from_phone_number);

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

        if(productsData.isMoreRequired){
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
        console.log(error);
        return 400;
    }
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
                "code": "en_us"
            },
            "components": [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "image",
                            "image": {
                                "link": process.env.IMAGE_URL+productId+".jpg"
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
                },
                {
                    "type": "button",
                    "sub_type": "quick_reply",
                    "index": "0",
                    "parameters": [
                      {
                        "type": "payload",
                        "payload": productId
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
                return await productMenuResponse(req, 0);
            case "productMenu":
                if(req.messages[0].interactive.list_reply.id.split("-")[1] == "More"){
                    const page = req.messages[0].interactive.list_reply.id.split("-")[2]
                    return await productMenuResponse(req, page);
                }
                return await productDetailsTemplateResponse(req);
            case "quantityMenu":
                return await sendConfirmationMessage(req)
            default:
                break;
        }
    } catch (error) {
        console.log(error);
        return 400;
    }
}

const sendConfirmationMessage = async (req) => {
    try {
        const phone_number_id = req.metadata.phone_number_id;
        const from_phone_number = req.messages[0].from;
        const productId = req.messages[0].interactive.list_reply.id.split("-")[2];
        let data = {
            messaging_product: "whatsapp",
            to: from_phone_number,
            type: "template",
            "template": {
                "name": "skalebot_confirmation",
                "language": {
                    "code": "en"
                },
                "components": [
                    {
                        "type": "button",
                        "sub_type": "quick_reply",
                        "index": "0",
                        "parameters": [
                          {
                            "type": "payload",
                            "payload": "Confirmation-Yes-" + productId
                          }
                        ]
                      },
                      {
                        "type": "button",
                        "sub_type": "quick_reply",
                        "index": "1",
                        "parameters": [
                          {
                            "type": "payload",
                            "payload": "Confirmation-No"
                          }
                        ]
                      }
                ]
            }
        }
        return await sendResponse(phone_number_id, data);
    } catch (error) {
        throw error;
    }
}
const sendQuantity = async (req) => {
    try {
        const phone_number_id = req.metadata.phone_number_id;
        const from_phone_number = req.messages[0].from;
        const productId = req.messages[0].button.payload;
        
        let data = {
            messaging_product: "whatsapp",
            to: from_phone_number,
            type: "interactive",
            interactive: {
                "type": "list",
                "header": {
                    "type": "text",
                    "text": "Select Quantity"
                },
                "body": {
                    "text": "select a Quantity"
                },
                "footer": {
                    "text": "Quantity"
                },
                "action": {
                    "button": "Quantity",
                    "sections": [
                        {
                            "title": "Quantities",
                            "rows": [
                                {
                                    "id": "quantityMenu-0-"+ productId,
                                    "title": "0-100"
                                },
                                {
                                    "id": "quantityMenu-1-"+ productId,
                                    "title": "100-500"
                                },
                                {
                                    "id": "quantityMenu-2-"+ productId,
                                    "title": "500-1000"
                                },
                                {
                                    "id": "quantityMenu-3-"+ productId,
                                    "title": "1000-above"
                                }
                            ]
                        }
                    ]
                }
            }
        }
        return await sendResponse(phone_number_id, data);
    } catch (error) {
        throw error;
    }
}
const productDetailResponse = async (req) => {
    try {
        const btnResponse = req.messages[0].button.text;
        const phone_number_id = req.metadata.phone_number_id;
        const from_phone_number = req.messages[0].from;
        const from_name = req.contacts[0].profile.name;
        if (btnResponse == "Buy Now") {
            // const productId = req.messages[0].button.payload;
            // addNewOrder(productId, from_name, from_phone_number);
            // let data = {
            //     messaging_product: "whatsapp",
            //     to: from_phone_number,
            //     type: "text",
            //     text: {
            //         "body": "Thank you your order is placed"
            //     }
            // }
            // return await sendResponse(phone_number_id, data);
            return await sendQuantity(req);
        }
        else if( btnResponse == "Yes") {
            const productId = req.messages[0].button.payload.split("-")[2];
            addNewOrder(productId, from_name, from_phone_number);
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