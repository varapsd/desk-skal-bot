
const axios = require("axios");
require("dotenv").config();

const whatsappApiService = require("../whatsappApi");
const whatsappPayloadService = require("../whatsappPayload");

var templateFlowService = {}

const getTemplate = async (id) => {
    try {
        const { data } = await axios.get(
            process.env.BACKEND_URL+"template/"+id,
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
}
const getNextTemplateId = async (flow, currentTemplateId) => {
    try {
        const templateIds = flow.split(",")
        if(currentTemplateId == 0){
            return Number(templateIds[0])
        }
        else{
            for (let i = 0; i < templateIds.length - 1; i++) {
                const id = Number(templateIds[i]);
                if(id == currentTemplateId){
                    return Number(templateIds[i+1]);
                }
            }
            return -1;
        }
    } catch (error) {
        throw error;
    }
}

const getMessageIds = async (req) => {
    try {
        const msgType = req.messages[0].type;
        if(msgType == "interactive"){
            const replyType = req.messages[0].interactive.type;
            if(replyType == "list_reply"){
                return req.messages[0].interactive.list_reply.id.split("-");
            }
        }
    } catch (error) {
        throw error;
    }
}
const replaceData = async (data, index, locations, key, value) => {
    if(index == locations.length - 1 ){
        data[locations[index]] =  data[locations[index]].replace(key, value)
        return data;
    }
    data[locations[index]] = await replaceData( data[locations[index]],index+1, locations, key, value)
    return data;
}

const assignData = async (data, index, locations, key, companyId, templateId,ids, page) => {
    if(index == locations.length -1 ){
        if(key == "{categories}"){
            const categories = await whatsappPayloadService.getCategoriesPaload(companyId, templateId, page);
            data[locations[index]] = categories;
            return data;
        }
        else if(key == "{products}"){
            const categoryId = ids[1];
            const products = await whatsappPayloadService.getProductsPayload(companyId, templateId, categoryId, page)
            data[location[index]] = products;
            return data;
        }
    }
    data[locations[index]] = await assignData( data[locations[index]],index+1, locations, key, companyId, templateId,ids, page)
    return data;
}

const sendTemplateMessage = async (companyId, templateId, req, ids, page)=> {
    try {
        const template = await getTemplate(templateId);
        console.log(template);
        const from_phone_number = req.messages[0].from;
        const phone_number_id = req.metadata.phone_number_id;
        let data = {
            messaging_product: "whatsapp",
            to: from_phone_number,
            type: template.type,
        }

        data[template.type] = template.payload;

        for (const variable of template.variables) {
            switch(variable.name){
                case "{userName}" : {
                    const userName = req.contacts[0].profile.name;
                    const locations = variable.location.split(",")
                    data[template.type] = await replaceData(data[template.type],0, locations, "{userName}", userName);
                    break;
                }
                case "{categories}" : {
                    const locations = variable.location.split(",");
                    data[template.type] = await assignData(data[template.type],0, locations, "{categories}", companyId, templateId, ids, page);
                    console.log(data);
                    console.log(JSON.stringify(data));
                }
            }
        };
        //console.log(data.action.sections);
        return await whatsappApiService.sendMessage(phone_number_id, data);
    } catch (error) {
        throw error;
    }
}


templateFlowService.sendInitialMessage = async (company, req) => {
    try {
        const templateId = await getNextTemplateId(company.templateFlow, 0);
        const ids = await getMessageIds(req);
        return await sendTemplateMessage(company.id, templateId, req, ids, 0);
    } catch (error) {
        throw error;
    }
}

templateFlowService.processFlow = async (company, req) => {
    try {
        const ids = await getMessageIds(req);
        let templateId = null;
        let page = 0;
        if(ids[ids.length - 2] == "More"){
            templateId = Number(ids[0])
            page = Number(ids[ids.length - 1]) + 1;
        }
        else{
            templateId = await getNextTemplateId(company.templateFlow, Number(ids[0]))
        }
        return await sendTemplateMessage(company.id, templateId, req, ids, page);
    } catch (error) {
        throw error;
    }
}

module.exports = templateFlowService;