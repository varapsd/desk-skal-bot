
const axios = require("axios");
require("dotenv").config();

const templateFlowService = require("../templateFlow");

var chatBotService = {};

const getCompanyDetails = async (phone) => {
    try {
        const { data } = await axios.get(
            process.env.BACKEND_URL+"company/phone/"+phone,
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
}
chatBotService.processMessage = async (req) => {
    try {
        if (req.object) {
            if (
                req.entry &&
                req.entry[0].changes &&
                req.entry[0].changes[0] &&
                req.entry[0].changes[0].value.messages &&
                req.entry[0].changes[0].value.messages[0]
            )
            {
                const companyDisplayPhoneNumber = req.entry[0].changes[0].value.metadata.display_phone_number;
                const msgType = req.entry[0].changes[0].value.messages[0].type;
                const reqData = req.entry[0].changes[0].value;
                const company = await getCompanyDetails(companyDisplayPhoneNumber);
                if(!company) return 400;

                if(msgType == "text"){
                    return await templateFlowService.sendInitialMessage(company, reqData);
                }
                else{
                    processFlow(companyId, reqData);
                }
            }
        }
            
    } catch (error) {
        throw error;
    }
}

module.exports = chatBotService;