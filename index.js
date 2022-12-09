

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
require("dotenv").config();
const axios = require('axios');
// Imports dependencies and set up http server
const request = require("request"),
    express = require("express"),
    body_parser = require("body-parser"),
    app = express().use(body_parser.json()); // creates express http server

const token = process.env.WHATSAPP_TOKEN;
const chatBotService = require("./services/chatBot/index");
const { gouribrandChatbot, initialMessage } = require( "./services/gouribrand");
// Sets server port and logs message on success
const port = process.env.PORT || 1337;
app.listen(port, () => console.log("webhook is listening on port : " + port));

app.get("/", async(req, res)=> {
    try {
        
        const reqdata = {
            "object": "whatsapp_business_account",
            "entry": [
              {
                "id": "113305784892003",
                "changes": [
                  {
                    "value": {
                      "messaging_product": "whatsapp",
                      "metadata": {
                        "display_phone_number": "916305846741",
                        "phone_number_id": "104919125798337"
                      },
                      "contacts": [
                        {
                          "profile": {
                            "name": "psd"
                          },
                          "wa_id": "919945320666"
                        }
                      ],
                      "messages": [
                        {
                          "from": "919945320666",
                          "id": "wamid.HBgMOTE5OTEyMzcyMjcyFQIAEhggQjYyN0M0NUEyRDUwNjVEMjYwRDg4RkQzNjFCNDg3QzgA",
                          "timestamp": "1667929481",
                          "text": {
                            "body": "Hai world"
                          },
                          "type": "text"
                        }
                      ]
                    },
                    "field": "messages"
                  }
                ]
              }
            ]
          };

          await gouribrandChatbot(reqdata)
        res.json("app running. !!");
    } catch (error) {
        console.log(error);
        throw error;
    }
})
app.post("/webhook", async (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2));

    //const response = await chatBotService.processMessage(req.body);
    const response = await gouribrandChatbot(req.body);
    console.log(response);
    res.sendStatus(200);
    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages

});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
    **/
    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === verify_token) {
            // Respond with 200 OK and challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// git commit -am "make it better"
// git push heroku master